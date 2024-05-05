"use client"
/** @jsxImportSource @emotion/react */ 
import { ChatBar } from "@/app/components/base/ChatBar";
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { db, storage } from "@/lib/firebase/config";
import { Group } from "@/types/group";
import { Message, MessageList } from "@/types/message";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Button } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { getDatabase, limitToFirst, onChildAdded, onValue, query, ref,limitToLast, orderByChild, update, remove, onChildChanged } from "firebase/database";
import { doc, getDoc, orderBy} from "firebase/firestore";
import { useRouter } from "next/navigation";
import CreateIcon from '@mui/icons-material/Create';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import 'mathlive'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import Link from "next/link";
import styled from "@emotion/styled";
import { DisabledByDefault } from "@mui/icons-material";
import { css } from "@emotion/react";
import { Image } from "@/types/image";
import { getDownloadURL, getStorage,ref as storageRef } from "firebase/storage";
declare global {
    namespace JSX {
        interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
        }
    }
}
const MessageTextItem = ({messageBody}:{messageBody:string}) =>{
    const MessageTextItemCSS = styled.p`
        work-break:break-all;
        width: 90%;
        white-space: pre-line;
    `;
    return(
        <MessageTextItemCSS>
            {messageBody}
        </MessageTextItemCSS>
    );
}

const MessageFormulaItem = ({i,messageBody}:{i:number,messageBody:string}) =>{
    const mf = useRef<MathfieldElement>(new MathfieldElement);
    useEffect(() => {
        if(!mf.current)return;
        mf.current.value = messageBody;
    },[messageBody])
    return(
        <math-field ref = {mf} id={`math-read${i}`} read-only>
            {messageBody}
        </math-field>
    );
}

export default function Page({params}:{params:{group_id:string,room_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const [pageGroup,setPageGroup] = useState<Group>();
    const [room,setRoom] = useState<Room>();
    const [messages,setMessages] = useState<Message[]>([]);
    const [members,setMembers] = useState<User[]>([]);
    const [message,setMessage] = useState<string>("");
    const [isRoomLoad,setIsRoomLoad] = useState<Boolean>(false);
    const [selectID,setSelectID] = useState<string|null>(null);
    const [clickMessage,setClickMessage] = useState<Message|null>(null);
    const [editMessage,setEditMessage] = useState<string>("");
    const [images,setImages] = useState<Image[]>([]);
    const [loadMessage,setLoadMessage] = useState(false);
    //const [messageImages,setMessageImages] = useState<Array<>>([]);
    const MessageMainItemCSS = css`
        min-height:50px;
        max-hegith:none;
        margin:4px;
        display:flex;
        margin-top:20px;
        padding:2px;
        position:relative;
        
    `;
    const MessageSubItemCSS = css`
        max-hegith:none;
        margin-left:4px;
        display:flex;
        padding:2px;
        position:relative;
    `;
    const noClickMessageCss = css`
        &:hover {
            background:#F0F0F0;
        }
    `
    const clickMessageCSS = css`
        background:#F0F0FF;
    `;
    const handleGetUser = async(user_id:string) =>{
        const ref = doc(db,`users/${user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            return appUser;
        }
        return {id:"",name:"", photoURL: ""};
    }
    const handleSolve = async() =>{
        if(!room)return;
        try{
            const db = getDatabase(); 
            const dbRef = ref(db, `rooms/${room.id}`);
            await update(dbRef, {
                type:"done"
            })
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    const handleUnsoleve = async() =>{
        if(!room)return;
        try{
            const db = getDatabase(); 
            const dbRef = ref(db, `rooms/${room.id}`);
            await update(dbRef, {
                type:"quest"
            }).then(async(room) => {

            })
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    const EditMessageButton = ({message}:{message:Message}) => {
        const EditMessageButtonCSS = styled.div`
            position:absolute;
            right:20px;
            font-size:1px;
            display:flex;
        `
        if(message.key != clickMessage?.key){
            if(message.key != selectID)return;
            return(
                <EditMessageButtonCSS>
                    <CreateIcon  onClick = {() => {
                        setClickMessage(message);
                        setEditMessage(message.body);
                    }}/>
                </EditMessageButtonCSS>
            );
        }else{
            return(
                <EditMessageButtonCSS>
                    <DeleteForeverIcon style={{marginRight:5}} onClick = {async() => {
                        if(!room)return;
                        if(!user)return;
                        setEditMessage("");
                        setClickMessage(null);
                        const rdb = getDatabase();
                        const roomMessageRef = ref(rdb,`roomMessages/${room.id}/${message.key}`)
                        await remove(roomMessageRef);
                        const userMessageRef = ref(rdb,`userMessages/${user.id}/${message.key}`)
                        await remove(userMessageRef);
                        const messageRef = ref(rdb,`messages/${message.key}`)
                        await remove(messageRef);
                    }}/>
                    <ClearIcon  onClick = {() => {
                        setClickMessage(null)
                        setEditMessage("");
                    }}/>
                </EditMessageButtonCSS>
            );
        }
    }


    function scrollBottom(){
        const chatArea = document.getElementById('chat-area');
        if(!chatArea)return;
        chatArea.scrollTop = chatArea.scrollHeight;
        const bottom = chatArea.scrollHeight - chatArea.clientHeight;
        chatArea.scroll(0, bottom);
    }
    useEffect(() => {
        const chatArea = document.getElementById('chat-list');
        if(!chatArea)return;
        setTimeout(scrollBottom,200);
    },[messages])
    
    useEffect(() => {
        try {
            const rdb = getDatabase()
            const rdbRef = ref(rdb,`groups/${params.group_id}`)
            return onValue(rdbRef,async(snapshot) => {
                const key = snapshot.key || "";
                const value = snapshot.val();
                setPageGroup({key:key,name:value.name});
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            router.back();
            return;
        }
    },[]);
    useEffect(() => {
        if(!pageGroup)return;
        const rdb = getDatabase()
        const roomRef = ref(rdb,`rooms/${params.room_id}`)
        return onValue(roomRef,async(snapshot) => {
            const key = snapshot.key || "";
            const value = snapshot.val();
            //const writer = await handleGetUser(value.writer_id);
            const room:Room = {id:key,title:value.title,writer_id:value.writer_id,type:value.type,sendAt:value.sendAt}
            setRoom(room);
            setIsRoomLoad(true);
        })
    },[pageGroup])
    useEffect(() => {
        if(!pageGroup)return;
        if(!room)return;
        const rdb = getDatabase()
        const roomMessagesRef = query(ref(rdb,`roomMessages/${params.room_id}`), limitToLast(100),orderByChild(`/sendAt`));
        setLoadMessage(true);
        return onChildAdded(roomMessagesRef,(snapshot) => {
            const key = snapshot.key || "";
            const value = snapshot.val();
            const messageRef = ref(rdb,`messages/${key}`);
            onValue(messageRef, (snapshot) => {
                const value = snapshot.val();
                if(value){
                    const message:Message = {key:key,body:value.body,sender_id:value.sender_id,room:room,type:value.type,images:[]}
                    setMessages((prev) =>{
                        const findex = prev.findIndex((v) => v.key == message.key);
                        if(findex == -1){
                            return [...prev,message];
                        }else{
                            return [...prev.slice(0,findex),message,...prev.slice(findex+1,prev.length)];
                        }
                    });
                }else{
                    setMessages((prev) =>{
                        const findex = prev.findIndex((v) => v.key == key);
                        if(findex != -1){
                            return [...prev.slice(0,findex),...prev.slice(findex+1,prev.length)];
                        }else{
                            return [...prev];
                        }
                        
                    });
                }
            })
            setLoadMessage(false);
        })
    },[isRoomLoad])
    useEffect(() => {
        if(!messages)return;
        const rdb = getDatabase()
        
        messages.map((message) => {
            const messageImageRef = query(ref(rdb,`messageImages/${message.key}`),orderByChild('number'));
            onChildAdded(messageImageRef,(snapshot) => {
                if(!snapshot)return;
                getDownloadURL(storageRef(storage, `messages/${snapshot.key}`))
                .then((url) => {
                    setMessages((prev) => {
                        const index = prev.findIndex((v) => (v.key == message.key));
                        if(index == -1)return prev;
                        const oldMessage = prev[index];
                        const newMessage:Message = {key:oldMessage.key,
                                            body:oldMessage.body,
                                            sender_id:oldMessage.sender_id,
                                            room:oldMessage.room,
                                            type:oldMessage.type,
                                            images:[...oldMessage.images,url]}
                        if(oldMessage.images.findIndex((v) => (v == url)) != -1)return prev;
                        return [...prev.slice(0,index),newMessage,...prev.slice(index+1,prev.length)];
                    })
                })
                .catch((error) => {
                    console.log(error);
                });
            });
        })
    },[messages])

    useEffect(() => {
        if(!pageGroup)return;
        const rdb = getDatabase()
        const groupMembersRef = ref(rdb,`groupUsers/${pageGroup.key}`)

        return onChildAdded(groupMembersRef,async(snapshot) => {
            const key = snapshot.key || "";
            const member = await handleGetUser(key);
            setMembers((prev) => [...prev,member]);
        })
    },[pageGroup])

    useEffect(() => {
        const fileArea = document.getElementById('dragArea');
        if(!fileArea)return;
        fileArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileArea.classList.add('dragover');
        });

        fileArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileArea.classList.remove('dragover');
        });
        fileArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileArea.classList.remove('dragover');
            if(!e.dataTransfer)return;
            const files = e.dataTransfer.files;
            if(typeof files[0] !== 'undefined') {
                for(let i = 0; i < files.length; i++){
                    if(files[i].type == "image/png" || files[i].type == "image/jpeg" || files[i].type == "image/gif"){
                        const image = {image:files[i],URL:window.URL.createObjectURL(files[i]),name:files[i].name};
                        setImages((prev) => [...prev,image])
                    }
                }
            } else {
                
            }
        });
        
    },[document.getElementById('dragArea')])
    if(room&&pageGroup&&user){
        return(
            <>
                <GroupsHeader>
                    <div style={{display:"flex",width:"100%"}}>
                        <div style={{flexGrow:1}}>
                            <p style={{fontWeight:"bold",fontSize:20,margin:16}}><Link href={`/home/group/${params.group_id}`}>{pageGroup.name}</Link>/{room.title}</p>
                        </div>
                        {
                            (room.type=="quest"&&room.writer_id === user.id)&&
                            <div style={{display:"flex"}}>
                                <p style={{fontSize:18,margin:17,marginRight:4}}>未解決</p>
                                <Button margin={3} onClick={handleSolve}>解決</Button>
                            </div>
                        }
                        {
                            (room.type=="done"&&room.writer_id === user.id)&&
                            <div style={{display:"flex"}}>
                                <p style={{fontSize:18,margin:17,marginRight:4}}>解決済</p>
                                <Button margin={3} onClick={handleUnsoleve}>未解決</Button>
                            </div>
                        }

                    </div>
                </GroupsHeader>
                <div id="dragArea" style={{display:"flex",flexDirection:"column",flexGrow:1}}>
                    <ChatBody>
                        <div id = "chat-list">
                            {
                            messages.map((message,i,lastUser) => {
                                    const sender = members.find((u) => (u.id === message.sender_id));
                                    if(i == 0 || lastUser.at(i-1)?.sender_id !== message.sender_id ){
                                        return(
                                            <div css = {[MessageMainItemCSS,(message!==clickMessage)?noClickMessageCss:clickMessageCSS]} onMouseOver={() => setSelectID(message.key)} onMouseLeave={() => setSelectID(null)} key = {i}>
                                                <img src={sender?.photoURL} alt="" style={{borderRadius:"50%",width:"48px",height:"48px"}} />
                                                <div style={{flexGrow:1,padding:2,marginLeft:8,minWidth:0}}>
                                                    <p style={{fontWeight:"bold"}}>{sender?.name}</p>
                                                    <div style={{display:"flex"}}>
                                                        {
                                                            message.images.map((image,j) => (
                                                                <img key={j} src={image} alt="" style={{width:"220px",height:"220px",objectFit:"contain",margin:5}}  />
                                                            ))
                                                        }
                                                    </div>
                                                    {
                                                        (message.type==="chat")&&<MessageTextItem messageBody={(message===clickMessage)?editMessage:message.body} />
                                                    }
                                                    {
                                                        
                                                        (message.type==="formula")&&<MessageFormulaItem i = {i} messageBody={(message===clickMessage)?editMessage:message.body} />
                                                                
                                                    }
                                                </div>
                                                {
                                                    (message.sender_id == user.id) &&
                                                    <EditMessageButton message={message}/>
                                                }
                                            </div>
                                        )
                                    }else{
                                        return(
                                            <div css = {[MessageSubItemCSS,(message!==clickMessage)?noClickMessageCss:clickMessageCSS]} onMouseOver={() => setSelectID(message.key)} onMouseLeave={() => setSelectID(null)} key = {i}>
                                                <div style={{minWidth:"48px"}}>
                                                </div>
                                                <div style={{flexGrow:1,minWidth:0,paddingLeft:2,marginLeft:8}}>
                                                    {
                                                        (message.images.length > 0)&&
                                                        <div id={`image_list${i}`} style={{maxWidth:"100%",display:"flex",overflowX:"scroll",clear:"both"}}>
                                                            {
                                                                message.images.map((image,j) => (
                                                                    <div key={j} style={{minWidth:220,margin:4,float:"left",backgroundColor:"#F5F5F5"}}>
                                                                        <img onClick={() => window.open(image)} src={image} alt="" style={{width:"200px",height:"200px",objectFit:"contain"}}  />                                                                    
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    }
                                                    <div>
                                                        {
                                                            (message.type==="chat")&&<MessageTextItem messageBody={(message===clickMessage)?editMessage:message.body} />
                                                        }
                                                        {
                                                            (message.type==="formula")&&<MessageFormulaItem i = {i} messageBody={(message===clickMessage)?editMessage:message.body} />
                                                        }
                                                    </div>
                                                </div>
                                                {
                                                    (message.sender_id == user.id) && 
                                                    <EditMessageButton message={message}/>
                                                }
                                            </div>
                                        )
                                    }
                                }) 
                            }
                        </div>
                    </ChatBody>
                    <ChatBar images = {images} setImages = {setImages} clickID = {(clickMessage)?clickMessage.key:null} setClickMessage={setClickMessage} editMessage = {editMessage} setEditMessage = {setEditMessage} isEditMessageType={(clickMessage)?clickMessage.type:""} room_id={params.room_id} message={message} setMessage={setMessage} />
                </div>
            </>
        );
    }
}