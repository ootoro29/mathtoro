'use client'
/** @jsxImportSource @emotion/react */ 
import { useAuth } from "@/context/auth";
import 'mathlive'
import { Box, Button, chakra, Input, Textarea } from "@chakra-ui/react";
import { getDatabase, push, ref, serverTimestamp, set, update } from "firebase/database";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { Dispatch, FormEvent, FormEventHandler, SetStateAction, useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import { css, TextareaAutosize, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import styled from "@emotion/styled";
import { Message } from "@/types/message";
import { Image } from "@/types/image";
import { storage } from "@/lib/firebase/config";
declare global {
    namespace JSX {
      interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
      }
    }
  }

const SendBottonCSS = styled.div`
    display:none;
    @media (max-width:834px){
        display:flex;
        flex-direction:column;
    }
`;
export const ChatBar = ({images,setImages,clickID,setClickMessage,editMessage,setEditMessage,isEditMessageType,room_id,message,setMessage}:{images:Image[],setImages:Dispatch<SetStateAction<Image[]>>,clickID:string|null,setClickMessage:Dispatch<SetStateAction<Message|null>>,editMessage:string,setEditMessage:Dispatch<SetStateAction<string>>,isEditMessageType:string,room_id:string,message:string,setMessage: Dispatch<SetStateAction<string>>}) => {
    const user = useAuth();
    const [isFormula,setIsFormula] = useState(false);
    const [chatMessage,setChatMessage] = useState("");
    const [formulaMessage,setFormulaMessage] = useState("");
    const [composing, setComposition] = useState(false);
    const [shift, setShift] = useState(false);
    const [enter, setEnter] = useState(false);
    const inputImagesRef = useRef<HTMLInputElement>(null);
    const handleCreateMessage = async() => {
        if(!user)return;
        const Message = message;
        const Images = images;
        setMessage("");
        if(isFormula){
            setFormulaMessage("");
        }else{
            setChatMessage("");
        }
        if(clickID === null){
            setImages([]);
        }
        if(clickID===null&&Images.length==0&&Message.replaceAll(" ","").replaceAll("　","").replaceAll('\n',"")==="")return;
        if(clickID!==null&&editMessage.replaceAll(" ","").replaceAll("　","").replaceAll('\n',"")==="")return;
        try{
            if(clickID === null){
                const rdb = getDatabase();
                const messageRef = ref(rdb,`messages`);
                await push(messageRef, {
                    body: Message,
                    sender_id:user.id,
                    room_id: room_id,
                    sendAt: serverTimestamp(),
                    type:(isFormula)?"formula":"chat"
                }).then(async(message) => {
                    for(let i = 0; i < Images.length; i++){
                        const date = new Date().getTime();
                        const name = Math.random().toString(36).slice(-8) + date;
                        const strf = storageRef(storage,`/messages/${name}`);//.${Images[i].name.split('.').pop()}
                        await uploadBytes(strf,Images[i].image).then(async(snapshot) => {
                            const messageImage = ref(rdb,`messageImages/${message.key}/${snapshot.ref.fullPath.split('/').pop()}`);
                            await set(messageImage,{
                                number:i,
                            })
                        })
                    }
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
            }else{
                const rdb = getDatabase();
                const messageRef = ref(rdb,`messages/${clickID}`);
                await update(messageRef,{
                    body:editMessage
                })
                setEditMessage("");
                setClickMessage(null);
            }
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    const ImageList = () => {
        const ImageListItemCSS = styled.div`
            margin:5px;
            padding:10px;
            background:#d5d5d5;
            min-width:250px;
            max-width:0px;
            height:260px;
            border-radius:5px;
            position:relative;
        `;
        const ImageDivItemCSS = styled.div`
            background:#e5e5e5;
            min-width:230px;
            max-width:0px;
            height:220px;
            border-radius:5px;
        `;
        const ImageDeleteButton = css`
            position: absolute;
            font-size:24px;
            right:6px;
            top:6px;
            color:#FF0000;
            &:hover{
                right:0px;
                top:0px;
                font-size:36px;
            }
        `;
        return(
            <Box id="scroll" onWheel={(e) => {
                const scrollElement = document.querySelector("#scroll");
                if(!scrollElement)return;
                if(Math.abs(e.deltaY) < Math.abs(e.deltaX))return;
                e.preventDefault();
                scrollElement.scrollLeft += e.deltaY;
            }} style={{width:"100%",minWidth:0,display:"flex",overflowX:"scroll", maxHeight:400,msOverflowStyle:"none",scrollbarWidth:"none"}}>
                {
                    images.map((image,i) => (
                        <ImageListItemCSS key = {i}>
                            <ImageDivItemCSS>
                                <img src={image.URL} alt={`Images[${i}]`} style={{width:"220px",height:"220px",objectFit:"contain"}} />
                            </ImageDivItemCSS>
                            <p style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{image.name}</p>
                            <HighlightOffIcon onClick = {
                                (e) => {
                                    setImages((prev) => {
                                        return [...prev.slice(0,i),...prev.slice(i+1,prev.length)];
                                    })
                                }}
                                css={ImageDeleteButton}/>
                        </ImageListItemCSS>
                    ))
                }
            </Box>    
        );
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
    useEffect(() => {
        if(isEditMessageType == "chat"){
            setIsFormula(false);
        }else if(isEditMessageType == "formula"){
            setIsFormula(true);
        }
    },[clickID])
    useEffect(() => {
        if(!mf.current)return;
        mf.current.value = formulaMessage;
        if(isEditMessageType == "formula"){
            mf.current.value = editMessage;
        }
    },[clickID,isFormula])
    return(
        <Box bg = "gray.200" id = "chat-bar" minHeight={"90px"} width="100%" >
            <ImageList />
            <Box bg = "gray.400" height={"25px"} color={"white"} >
                <label style={{fontWeight:"bold",margin:3}}>数式表示</label>
                <input 
                    type="checkbox" 
                    checked={isFormula} 
                    onChange={(e) => {
                        setMessage((e.target.checked)?formulaMessage:chatMessage);
                        setIsFormula(e.target.checked);
                    }} 
                    disabled={(clickID!==null)}
                ></input>
            </Box>
            <chakra.form>
                <Box minHeight={"30px"} style={{display:"flex",margin:10}}>
                    {
                        (!isFormula)&&
                        <TextareaAutosize
                            value={(clickID!==null && isEditMessageType=="chat")?editMessage:chatMessage} 
                            onChange = {(e) => {
                                if(enter){
                                    if(!shift){
                                        if (window.matchMedia('(max-width: 834px)').matches) {
                                        } else if (window.matchMedia('(min-width:834px)').matches) {
                                            handleCreateMessage();
                                            e.preventDefault();
                                            return;
                                        }
                                    }
                                }
                                if((clickID!==null)){
                                    setEditMessage(e.target.value)
                                }else{
                                    setChatMessage(e.target.value)
                                }
                                
                                setMessage(e.target.value)
                            }}
                            onCompositionStart={() => setComposition(true)}
                            onCompositionEnd={() => setComposition(false)}   
                            minRows={1}
                            maxRows={10} 
                            style={{flexGrow:1,paddingLeft:3,paddingBottom:3,paddingTop:3,border:"black solid 1px",background:"white",resize:"none",minHeight:30+"px"}}
                        >

                        </TextareaAutosize>
                    }
                    {
                        (isFormula)&&
                        <math-field
                            ref = {mf}
                            aria-valuetext={(clickID!==null)?editMessage:formulaMessage}
                            onInput={
                                (evt: FormEvent<MathfieldElement>) => {
                                    const f = evt.currentTarget.value;
                                    if(clickID!==null){
                                        setEditMessage(f);
                                    }else{
                                        setFormulaMessage(f)
                                        setMessage(f)
                                    }
                                }
                            }
                            aria-multiline = {true}
                            id = {"math-field"}
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
                    <SendBottonCSS>
                        <div style={{flexGrow:1}}></div>
                        <Button onClick={handleCreateMessage}>
                            <SendIcon style={{fontSize:20,margin:2}}/>
                        </Button>
                    </SendBottonCSS>
                    <SendBottonCSS>
                        <div style={{flexGrow:1}}></div>
                        <Button onClick={() => inputImagesRef.current?.click()}>
                            <AddPhotoAlternateIcon style={{fontSize:20,margin:2}} />
                        </Button>
                        <input 
                            multiple 
                            ref = {inputImagesRef} 
                            type="file" 
                            accept="image/*"
                            style={{display:"none"}} 
                            onChange={(e) => {
                                const files = e.target.files;
                                if(!files)return;
                                if(typeof files[0] !== 'undefined') {
                                    for(let i = 0; i < files.length; i++){
                                        if(files[i].type == "image/png" || files[i].type == "image/jpeg" || files[i].type == "image/gif"){
                                            const image = {image:files[i],URL:window.URL.createObjectURL(files[i]),name:files[i].name};
                                            setImages((prev) => [...prev,image])
                                        }
                                    }
                                } 
                            }} 
                        />
                    </SendBottonCSS>
                </Box>
            </chakra.form>
        </Box>
    );
}