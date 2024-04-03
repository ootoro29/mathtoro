'use client'
import { useAuth } from "@/context/auth";
import 'mathlive'
import { Box, Button, chakra, Input } from "@chakra-ui/react";
import { getDatabase, push, ref, set } from "firebase/database";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { MathfieldElement } from "mathlive";

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
    const handleCreateMessage = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!user)return;
        if(message.replace(" ","").replace("　","")==="")return;
        try{
            const rdb = getDatabase();
            const messageRef = ref(rdb,`messages`);
            await push(messageRef, {
                body: message,
                sender_id:user.id,
                room_id: room_id,
                type:(isFormula)?"formula":"chat"
            }).then(async(message) => {
                const dbRoomMessagesRef = ref(rdb,`roomMessages/${room_id}/${message.key}`);
                await set(dbRoomMessagesRef,{
                    exist: true
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
    return(
        <Box bg = "gray.200" >
            <Box bg = "gray.400" height={"25px"} color={"white"} >
                <label style={{fontWeight:"bold",margin:3}}>数式表示</label>
                <input 
                    type="checkbox" 
                    checked={isFormula} 
                    onChange={(e) => {
                        setMessage((e.target.checked)?formulaMessage:chatMessage);
                        setIsFormula(e.target.checked)
                    }} 
                ></input>
            </Box>
            <chakra.form onSubmit = {handleCreateMessage}>
                <Box minHeight={"30px"} style={{display:"flex",margin:10}}>
                    {
                        (!isFormula)&&
                        <Input 
                            value={(isFormula)?formulaMessage:chatMessage} 
                            onChange = {(e) => {
                                (isFormula)?setFormulaMessage(e.target.value):setChatMessage(e.target.value)
                                setMessage(e.target.value)
                            }} style={{border:"black solid 1px",background:"white",minHeight:45+"px"}}></Input>
                    }
                    {
                        (isFormula)&&
                        <math-field
                            onInput={
                                (evt: React.ChangeEvent<HTMLElement>) => {
                                    const f = evt.target.value;
                                    setFormulaMessage(f)
                                    setMessage(f)
                                }
                            }
                            style={{width:100+"%",minHeight:45+"px"}}
                            math-mode-space = {"\\:"}
                        >
                            {formulaMessage}
                        </math-field>
                    }
                    <Button type="submit" style={{border:"black solid 1px"}} height={"50px"} >送信</Button>
                </Box>
            </chakra.form>
        </Box>
    );
}