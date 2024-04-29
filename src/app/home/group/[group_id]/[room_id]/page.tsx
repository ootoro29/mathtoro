"use client"
import { ChatBar } from "@/app/components/base/ChatBar";
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { db } from "@/lib/firebase/config";
import { Group } from "@/types/group";
import { Message, MessageList } from "@/types/message";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Button } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { getDatabase, limitToFirst, onChildAdded, onValue, query, ref,limitToLast, orderByChild, update } from "firebase/database";
import { doc, getDoc, orderBy} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Script from "next/script";
import 'mathlive'
import { useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import Link from "next/link";

declare global {
    namespace JSX {
        interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
        }
    }
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
    const handleGetUser = async(user_id:string) =>{
        const ref = doc(db,`users/${user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            return appUser;
        }
        return {id:"",name:"", photoURL: ""};
    }
    const handleSoleve = async() =>{
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
        chatArea.addEventListener("load",() => alert('load'));
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
            const writer = await handleGetUser(value.writer_id);
            const room:Room = {id:key,title:value.title,writer:writer,type:value.type}
            setRoom(room);
            setIsRoomLoad(true);
        })
    },[pageGroup])
    useEffect(() => {
        if(!pageGroup)return;
        if(!room)return;
        const rdb = getDatabase()
        const roomMessagesRef = query(ref(rdb,`roomMessages/${params.room_id}`), limitToLast(100),orderByChild(`/sendAt`));
        return onChildAdded(roomMessagesRef,(snapshot) => {
            const key = snapshot.key || "";
            const value = snapshot.val();
            const messageRef = ref(rdb,`messages/${key}`);
            onValue(messageRef, (snapshot) => {
                const value = snapshot.val();
                //const sender = await handleGetUser(value.sender_id);
                const message:Message = {key:key,body:value.body,sender_id:value.sender_id,room:room,type:value.type}
                setMessages((prev) => [...prev,message]);
            })
        })
    },[isRoomLoad])
    

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

    
    if(room&&pageGroup&&user){
        return(
            <>
                <GroupsHeader>
                    <div style={{display:"flex",width:"100%"}}>
                        <div style={{flexGrow:1}}>
                            <p style={{fontWeight:"bold",fontSize:20,margin:16}}><Link href={`/home/group/${params.group_id}`}>{pageGroup.name}</Link>/{room.title}</p>
                        </div>
                        {
                            (room.type=="quest"&&room.writer.id === user.id)&&
                            <div style={{display:"flex"}}>
                                <p style={{fontSize:18,margin:17,marginRight:4}}>未解決</p>
                                <Button margin={3} onClick={handleSoleve}>解決</Button>
                            </div>
                        }
                        {
                            (room.type=="done"&&room.writer.id === user.id)&&
                            <div style={{display:"flex"}}>
                                <p style={{fontSize:18,margin:17,marginRight:4}}>解決済</p>
                                <Button margin={3} onClick={handleUnsoleve}>未解決</Button>
                            </div>
                        }

                    </div>
                </GroupsHeader>
                <ChatBody>
                    <div id = "chat-list">
                        {
                            
                           messages.map((message,i,lastUser) => {
                                const sender = members.find((u) => (u.id === message.sender_id));
                                if(i == 0 || lastUser.at(i-1)?.sender_id !== message.sender_id ){
                                    return(
                                        <div key = {i} style={{minHeight:"50px",maxHeight:"none",margin:4,display:"flex",marginTop:20}}>
                                            <img src={sender?.photoURL} alt="" style={{borderRadius:"50%",width:"48px",height:"48px"}} />
                                            <div style={{flexGrow:1,padding:2,marginLeft:8,minWidth:0}}>
                                                <p style={{fontWeight:"bold"}}>{sender?.name}</p>
                                                {
                                                    (message.type==="chat")&&<p style={{wordBreak:"break-all",width:"90%",whiteSpace: 'pre-line'}}>{message.body}</p>
                                                }
                                                {
                                                    
                                                    (message.type==="formula")&&
                                                        <math-field id={`math-read${i}`} read-only>
                                                            {message.body}
                                                        </math-field>     
                                                }
                                            </div>
                                        </div>
                                    )
                                }else{
                                    return(
                                        <div key = {i} style={{maxHeight:"none",marginLeft:4,display:"flex"}}>
                                            <div style={{minWidth:"48px"}}>
                                            </div>
                                            <div style={{flexGrow:1,paddingLeft:2,marginLeft:8}}>
                                                {
                                                    (message.type==="chat")&&<p style={{wordBreak:"break-all",width:"90%",whiteSpace: 'pre-line'}}>{message.body}</p>
                                                }
                                                {
                                                    (message.type==="formula")&&
                                                        <math-field id={`math-read${i}`} read-only>
                                                            {message.body}
                                                        </math-field>
                                                }
                                                
                                            </div>
                                        </div>
                                    )
                                }
                            }) 
                        }
                    </div>
                </ChatBody>
                <ChatBar room_id={params.room_id} message={message} setMessage={setMessage} />
            </>
        );
    }
}