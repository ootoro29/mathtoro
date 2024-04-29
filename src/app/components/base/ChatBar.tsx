'use client'
import { useAuth } from "@/context/auth";
import 'mathlive'
import { Box, Button, chakra, Input, Textarea } from "@chakra-ui/react";
import { getDatabase, push, ref, serverTimestamp, set } from "firebase/database";
import { Dispatch, FormEvent, FormEventHandler, SetStateAction, useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import { TextareaAutosize, TextField } from "@mui/material";

declare global {
    namespace JSX {
      interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
      }
    }
  }

export const ChatBar = ({room_id,message,setMessage}:{room_id:string,message:string,setMessage: Dispatch<SetStateAction<string>>}) => {
    const user = useAuth();
    const [isFormula,setIsFormula] = useState(false);
    const [chatMessage,setChatMessage] = useState("");
    const [formulaMessage,setFormulaMessage] = useState("");
    const [composing, setComposition] = useState(false);
    const [shift, setShift] = useState(false);
    const [enter, setEnter] = useState(false);
    const handleCreateMessage = async() => {
        if(!user)return;
        if(message.replaceAll(" ","").replaceAll("　","").replaceAll('\n',"")==="")return;
        try{
            const rdb = getDatabase();
            const messageRef = ref(rdb,`messages`);
            await push(messageRef, {
                body: message,
                sender_id:user.id,
                room_id: room_id,
                sendAt: serverTimestamp(),
                type:(isFormula)?"formula":"chat"
            }).then(async(message) => {
                const dbRoomMessagesRef = ref(rdb,`roomMessages/${room_id}/${message.key}`);
                await set(dbRoomMessagesRef,{
                    exist: true,
                    sendAt: serverTimestamp(),
                })
                const dbUserMessagesRef = ref(rdb,`userMessages/${user.id}/${message.key}`);
                await set(dbUserMessagesRef,{
                    exist: true
                })
            })
            setMessage('');
            if(isFormula){
                setFormulaMessage("");
            }else{
                setChatMessage("");
            }
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    const mf = useRef<MathfieldElement>(new MathfieldElement);
    useEffect(() => {
        document.addEventListener("keydown",(e) => {
            if(e.key == "Shift"){
                setShift(true);
            }
            if(e.key == "Enter"){
                setEnter(true);
            }
        })
        document.addEventListener("keyup",(e) => {
            if(e.key == "Shift"){
                setShift(false);
            }
            if(e.key == "Enter"){
                setEnter(false);
            }
        })
    },[])
    useEffect(() => {
        const container = document.getElementById("chat-bar");
        if(!container)return;
        window.mathVirtualKeyboard.addEventListener("geometrychange", () => {
            container.style.height = (90+window.mathVirtualKeyboard.boundingRect.height)+"px";
        });
        
    },[]);
    
    return(
        <Box bg = "gray.200" id = "chat-bar" minHeight={"90px"} >
            <Box bg = "gray.400" height={"25px"} color={"white"} >
                <label style={{fontWeight:"bold",margin:3}}>数式表示</label>
                <input 
                    type="checkbox" 
                    checked={isFormula} 
                    onChange={(e) => {
                        setMessage((e.target.checked)?formulaMessage:chatMessage);
                        setIsFormula(e.target.checked);
                    }} 
                ></input>
            </Box>
            <form>
                <Box minHeight={"30px"} style={{display:"flex",margin:10}}>
                    {
                        (!isFormula)&&
                        <TextareaAutosize
                            value={(isFormula)?formulaMessage:chatMessage} 
                            onChange = {(e) => {
                                if(enter){
                                    if(!shift){
                                        handleCreateMessage();
                                        e.preventDefault();
                                        return;
                                    }
                                }
                                (isFormula)?setFormulaMessage(e.target.value):setChatMessage(e.target.value)
                                
                                setMessage(e.target.value)
                            }}
                            onCompositionStart={() => setComposition(true)}
                            onCompositionEnd={() => setComposition(false)}   
                            minRows={1}
                            maxRows={10} 
                            style={{flexGrow:1,paddingLeft:3,paddingBottom:3,paddingTop:3,border:"black solid 1px",background:"white",resize:"none",minHeight:30+"px"}}
                        >

                        </TextareaAutosize>
                        /*
                        <textarea 
                            value={(isFormula)?formulaMessage:chatMessage} 
                            onChange = {(e) => {
                                (isFormula)?setFormulaMessage(e.target.value):setChatMessage(e.target.value)
                                setMessage(e.target.value)
                            }} 
                            rows = {1}
                            style={{flexGrow:1,padding:2,border:"black solid 1px",background:"white",resize:"none"}}
                        />
                        */
                        
                        
                    }
                    {
                        (isFormula)&&
                        <math-field
                            ref = {mf}
                            onInput={
                                (evt: FormEvent<MathfieldElement>) => {
                                    const f = evt.currentTarget.value;
                                    setFormulaMessage(f)
                                    setMessage(f)
                                }
                            }
                            id = {"formula"}
                            style={{width:100+"%",minHeight:45+"px"}}
                            math-mode-space = {"\\:"}
                            onKeyDownCapture={(e) =>{
                                if(e.key == "Enter"){
                                    handleCreateMessage();
                                }
                            }}
                        >
                            {formulaMessage}
                        </math-field>
                    }
                </Box>
            </form>
        </Box>
    );
}