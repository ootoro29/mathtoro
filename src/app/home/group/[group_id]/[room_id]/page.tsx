"use client"
import { ChatBar } from "@/app/components/base/ChatBar";
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { db } from "@/lib/firebase/config";
import { Group } from "@/types/group";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { getDatabase, onChildAdded, onValue, ref } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page({params}:{params:{group_id:string,room_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const [pageGroup,setPageGroup] = useState<Group>();
    const [room,setRoom] = useState<Room>();
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
        try{
            let pass = false;
            if(!user||pass)return;
            const rdb = getDatabase()
            const dbGroupUser = ref(rdb,`groupUsers/${params.group_id}/${user.id}`)
            return onValue(dbGroupUser, (snapshot) => {
                if(!snapshot.exists()){
                    router.back();
                    pass = true;
                    return;
                }else{
                    const dbGroupRoomsRef = ref(rdb, `groupRooms/${params.group_id}/${params.room_id}`)
                    onValue(dbGroupRoomsRef, (snapshot) => {
                        if(!snapshot.exists()){
                            router.back();
                            pass = true;
                            return;
                        }else{
                            const dbGroupRef = ref(rdb,`groups/${params.group_id}`)
                            onValue(dbGroupRef,async(snapshot) => {
                                const key = snapshot.key || "";
                                const value = snapshot.val();
                                setPageGroup({key:key,name:value.name})
                            })
                            const dbRoomRef = ref(rdb,`rooms/${params.room_id}`)
                            onValue(dbRoomRef,async(snapshot) => {
                                const value = snapshot.val();
                                setRoom({id:params.room_id,title:value.title,writer:value.writer});
                            })
                        }
                    })
                }
            })
        }catch(e){
            console.log(e);
            return;
        }
    },[user]);
    if(room&&pageGroup){
        return(
            <>
                <GroupsHeader>
                    <p style={{fontWeight:"bold",fontSize:20,margin:16}}>{pageGroup.name}/{room.title}</p>
                </GroupsHeader>
                <ChatBody>チャット本文</ChatBody>
                <ChatBar />
            </>
        );
    }
}