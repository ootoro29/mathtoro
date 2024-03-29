"use client"
import { ChatBar } from "@/app/components/base/ChatBar";
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { db } from "@/lib/firebase/config";
import { Group } from "@/types/group";
import { Message } from "@/types/message";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Button } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { getDatabase, limitToFirst, onChildAdded, onValue, query, ref,limitToLast } from "firebase/database";
import { doc, getDoc} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
export default function Page({params}:{params:{group_id:string,room_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const [pageGroup,setPageGroup] = useState<Group>();
    const [room,setRoom] = useState<Room>();
    const [messages,setMessages] = useState<Message[]>([]);
    const [message,setMessage] = useState<string>("");
    const handleGetUser = async(user_id:string) =>{
        const ref = doc(db,`users/${user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            return appUser;
        }
        return {id:"",name:"", photoURL: ""};
    }
    function scrollBottom(){
        console.log("AAAAAAA");
        let chatArea = document.getElementById('chat-area');
        if(!chatArea)return;
        let chatAreaHeight = chatArea.scrollHeight;
        chatArea.scrollTop = chatAreaHeight;
        let bottom = chatArea.scrollHeight - chatArea.clientHeight;
        chatArea.scroll(0, bottom);
    }
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
        onValue(roomRef,async(snapshot) => {
            const key = snapshot.key || "";
            const value = snapshot.val();
            const writer = await handleGetUser(value.writer_id);
            const room:Room = {id:key,title:value.title,writer:writer}
            setRoom(room);
        })
    },[pageGroup])
    useEffect(() => {
        if(!pageGroup)return;
        if(!room)return;
        const rdb = getDatabase()
        const roomMessagesRef = query(ref(rdb,`roomMessages/${params.room_id}`), limitToLast(100));
        onChildAdded(roomMessagesRef,(snapshot) => {
            const key = snapshot.key || "";
            const value = snapshot.val();
            const messageRef = ref(rdb,`messages/${key}`);
            onValue(messageRef, async(snapshot) => {
                const value = snapshot.val();
                const sender = await handleGetUser(value.sender_id);
                const message:Message = {key:key,body:value.body,sender:sender,room:room}
                setMessages((prev) => [...prev,message]);
            })
        })
        if(messages.length == 0)return;
    },[room])
    useEffect(() => {
        return scrollBottom();
    },[messages.length]);
    if(room&&pageGroup){
        return(
            <>
                <GroupsHeader>
                    <p style={{fontWeight:"bold",fontSize:20,margin:16}}>{pageGroup.name}/{room.title}</p>
                </GroupsHeader>
                <ChatBody>
                    <div>
                        {
                           messages.map((message,i) => (
                                <div key = {i} style={{height:"50px",margin:4,display:"flex",marginTop:20,marginBottom:20}}>
                                    <img src={message.sender.photoURL} alt="" width={48} height={48} style={{borderRadius:"50%"}} />
                                    <div style={{flexGrow:1,padding:2,marginLeft:8}}>
                                        <p style={{fontWeight:"bold"}}>{message.sender.name}</p>
                                        <p style={{textIndent:5}}>{message.body}</p>
                                    </div>
                                </div>
                           )) 
                        }
                    </div>
                </ChatBody>
                <ChatBar room_id={params.room_id} message={message} setMessage={setMessage} />
            </>
        );
    }
}