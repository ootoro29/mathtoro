"use client"

import { FirebaseError } from "firebase/app";
import { getDatabase, onChildAdded, ref,onValue, push, set, child } from "firebase/database";
import { FormEvent, useEffect, useState } from "react";
import { Group } from "@/types/group";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { ChatBody } from "@/app/components/base/ChatBody";
import { User } from "@/types/user";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Button, chakra, Input } from "@chakra-ui/react";
import { Room } from "@/types/room";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Phone } from "@mui/icons-material";
import Link from "next/link";

export default function Page({params}:{params:{group_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const[pageGroup,setPageGroup] = useState<Group>();
    const[members, setMembers] = useState<User[]>([]);
    const[rooms, setRooms] = useState<Room[]>([]);
    const[roomName,setRoomName] = useState("");
    const[inviteID,setInviteID] = useState("");

    const handleCreateRoom = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(roomName == "")return;
        if(!user)return;
        if(!pageGroup)return;
        try{
            const db = getDatabase(); 
            const dbRef = ref(db, 'rooms')
            await push(dbRef, {
                title: roomName,
                writer_id:user.id,
                group_id: pageGroup.key
            }).then(async(room) => {
                const dbGroupRoomRef = ref(db,`groupRooms/${params.group_id}/${room.key}`);
                await set(dbGroupRoomRef,{
                    exist: true
                })
                const dbUserRoomRef = ref(db,`userRooms/${user.id}/${room.key}`);
                await set(dbUserRoomRef,{
                    exist: true
                })
            })
            setRoomName('')
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    const handleGetUser = async(user_id:string) =>{
        const ref = doc(db,`users/${user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            return appUser;
        }
        return {id:"",name:"", photoURL: ""};
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
        const groupMembersRef = ref(rdb,`groupUsers/${pageGroup.key}`)
        return onChildAdded(groupMembersRef,async(snapshot) => {
            const key = snapshot.key || "";
            const member = await handleGetUser(key);
            setMembers((prev) => [...prev,member]);
        })
    },[pageGroup])

    useEffect(() => {
        if(!pageGroup)return;
        const rdb = getDatabase()
        const groupRoomsRef = ref(rdb,`groupRooms/${pageGroup.key}`)
        return onChildAdded(groupRoomsRef,(snapshot) => {
            const key = snapshot.key || "";
            const groupRoomsRef = ref(rdb,`rooms/${key}`)
            onValue(groupRoomsRef,async(snaproom) => {
                const value = snaproom.val();
                const writer = await handleGetUser(value.writer_id);
                const room:Room = {id:key,title:value.title,writer:writer}
                setRooms((prev) => [...prev,room]);
            })
        })
    },[pageGroup])

    useEffect(() => {
        if(!pageGroup)return;
        const rdb = getDatabase()
        const groupRoomsRef = ref(rdb,`invites/${pageGroup.key}`)
        return onChildAdded(groupRoomsRef,(snapshot) => {
            const key = snapshot.key || "";
            setInviteID(key);
        })
    },[pageGroup])


    if(pageGroup){
        return(
            <>
                <GroupsHeader>
                    <p style={{fontWeight:"bold",fontSize:20,margin:16}}>{pageGroup.name}</p>
                </GroupsHeader>
                <ChatBody>
                    {   (rooms.length!=0)&&
                        <div style={{margin:4}}>
                            <p>Rooms</p>
                            <div style={{display:"flex", overflowX:"scroll",flexBasis:0,width:500}}>
                                {
                                    rooms.map((room:Room,i) => (
                                        <Link href={`/home/group/${params.group_id}/${room.id}`} key = {i}>
                                            <div style={{border:"gray solid 2px",width:"100px",float:"left",height:"140px", padding:2,margin:4,flexShrink:0}}  >
                                                <p style={{fontSize:14,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{room.title}</p>
                                                <p style={{fontSize:10,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{room.writer.name}</p>
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    }
                    <chakra.form onSubmit = {handleCreateRoom}>
                        <label>ルーム名</label>
                        <Input type="text" value={roomName} maxWidth={"300px"} margin={4} onChange={(e) => {setRoomName(e.target.value)}} />
                        <Button type="submit"> 作成</Button>
                    </chakra.form>
                    <p>Members</p>
                    
                    {
                        members.map((member:User,i) => (
                            <div key = {i}>
                                <p>{member.name}</p>
                                <img src={member.photoURL} alt="" width={48} height={48} style={{borderRadius:"50%"}} />
                            </div>
                        ))
                    }
                    <p>招待URL: {window.location.origin}/invite/{pageGroup.key}/{inviteID}</p>
                </ChatBody>
            </>
        );
    }
}