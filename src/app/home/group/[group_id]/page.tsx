"use client"

import { FirebaseError } from "firebase/app";
import { getDatabase, onChildAdded, ref,onValue, push, set, child, query, equalTo, orderByChild, limitToFirst,limitToLast, orderByKey, orderByValue, serverTimestamp } from "firebase/database";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Group } from "@/types/group";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { ChatBody } from "@/app/components/base/ChatBody";
import { User } from "@/types/user";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Button, calc, chakra, Input, MenuItem, Select } from "@chakra-ui/react";
import { Room } from "@/types/room";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { RoomType } from "@/types/roomtype";
import { RoomListItem } from "@/app/components/base/RoomListItem";
import { GroupBody } from "@/app/components/base/GroupBody";
import styled from "@emotion/styled";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HomeIcon from '@mui/icons-material/Home';

const HomeMemberList = styled.div`
    @media(max-width:834px){
        display:none;   
    }
    display:flex;
    flex-direction:column;
`;
const MembersList = ({members}:{members:User[]}) => {
    return(
        <div>
            <p>Members</p>
            <div style={{flexGrow:1,margin:3,maxWidth:200,minWidth:200,maxHeight:400,overflowY:"scroll"}}>
                {
                    members.map((member:User,i) => (
                        <Link key = {i} href={`/home/user/${member.id}`}>
                            <div style={{display:"flex",margin:6,marginRight:0,marginLeft:0}}>
                                
                                <img src={member.photoURL} alt="" width={36} height={36} style={{borderRadius:"50%",minWidth:36,minHeight:36}} />
                                <p style={{margin:4,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{member.name}</p>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </div>
    );
}

export default function Page({params}:{params:{group_id:string}}){
    const user = useAuth();
    const router = useRouter();
    const[pageGroup,setPageGroup] = useState<Group>();
    const[members, setMembers] = useState<User[]>([]);
    const[rooms, setRooms] = useState<Room[]>([]);
    const[filterdRooms, setFilterdRooms] = useState<Room[]>([]);
    const[roomName,setRoomName] = useState("");
    const[inviteID,setInviteID] = useState("");
    const[type,setType] = useState<RoomType>({type:"quest"});
    const[filterSetting,setFilterSetting] = useState<Array<boolean>>([false,false,false]);

    const handleCreateRoom = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(roomName == "")return;
        if(!user)return;
        if(!pageGroup)return;
        try{
            const db = getDatabase(); 
            const dbRef = ref(db, 'rooms');
            await push(dbRef, {
                title: roomName,
                writer_id:user.id,
                group_id: pageGroup.key,
                type:type.type,
                sendAt:serverTimestamp(),
            }).then(async(room) => {
                const dbGroupRoomRef = ref(db,`groupRooms/${params.group_id}/${room.key}`);
                await set(dbGroupRoomRef,{
                    exist: true,
                    sendAt:serverTimestamp(),
                })
                const dbUserRoomRef = ref(db,`userRooms/${user.id}/${room.key}`);
                await set(dbUserRoomRef,{
                    exist: true,
                    sendAt:serverTimestamp(),
                })
            })
            setRoomName('')
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    function convertRoomType(value:string) {
        const roomType:RoomType = {type:"quest"};
        switch(value){
            case "quest":
                roomType.type = "quest"
                break;
            case "point":
                roomType.type = "point"
                break;
            case "done":
                roomType.type = "done"
                break;
            case "other":
                roomType.type = "other"
                break;
            case "talk":
                roomType.type = "talk"
                break;
        }
        
        return roomType;
    }
    
    const handleRoomType = (value:string) => {
        setType(convertRoomType(value));
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
            const rdb = getDatabase();
            const rdbRef = ref(rdb,`groups/${params.group_id}`);
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
        const groupRoomsRef = query(ref(rdb,`groupRooms/${pageGroup.key}`), limitToLast(100),orderByChild('/sendAt'))
        return onChildAdded(groupRoomsRef,(snapshot) => {
            const key = snapshot.key || "";
            const groupRoomsRef = ref(rdb,`rooms/${key}`)
            onValue(groupRoomsRef,async(snaproom) => {
                if(!snaproom.exists()) return;
                const value = snaproom.val();
                //const writer = await handleGetUser(value.writer_id);
                const room:Room = {id:key,title:value.title,writer_id:value.writer_id,type:value.type,sendAt:value.sendAt}
                setRooms((prev) => {
                    const findex = prev.findIndex((v) => v.id == room.id);
                    if(findex == -1){
                        return [room,...prev];
                    }else{
                        return [...prev.slice(0,findex),room,...prev.slice(findex+1,prev.length)];
                    }                    
                });
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
                    <div style={{display:"flex"}}>
                        <p style={{flexGrow:1,fontWeight:"bold",fontSize:20,margin:15}}>{pageGroup.name}</p>
                        <div style={{margin:9}}>
                            <HomeIcon style={{fontSize:30,margin:2}} />
                            <PeopleAltIcon style={{fontSize:30,margin:2}} />
                        </div>
                    </div>
                </GroupsHeader>
                <GroupBody>
                    <div style={{display:"flex",minHeight:"100%"}}>
                        <div style={{flexGrow:1,minWidth:0, margin:3}}>
                            {   (rooms.length!=0)&&
                                <div style={{margin:4}}>
                                    <div style={{display:"flex"}}>
                                        <p style={{marginRight:5}}>Rooms</p>
                                        <label style={{marginLeft:6}}>質問</label>
                                        <input type="checkbox" checked={filterSetting[0]} onClick={() => setFilterSetting((prev) => ([!prev[0],...prev.slice(1,prev.length)]))} />
                                        <label style={{marginLeft:6}}>解説</label>
                                        <input type="checkbox" checked={filterSetting[1]} onClick={() => setFilterSetting((prev) => ([...prev.slice(0,1),!prev[1],...prev.slice(2,prev.length)]))} />
                                        <label style={{marginLeft:6}}>完了</label>
                                        <input type="checkbox" checked={filterSetting[2]} onClick={() => setFilterSetting((prev) => ([...prev.slice(0,2),!prev[2]]))} />
                                    </div>
                                    <div style={{display:"flex", overflowY:"scroll",flexDirection:"column",width:"100%",maxHeight:400}}>
                                        {
                                            rooms
                                            .filter((room) => (room.type == "quest" && filterSetting[0]) || (room.type == "point" && filterSetting[1]) || (room.type == "done" && filterSetting[2] || (!filterSetting[0] && !filterSetting[1] && !filterSetting[2])))
                                            .map((room:Room,i) => {
                                                const writer = members.find((v) => (v.id == room.writer_id));
                                                
                                                if(!writer)return;
                                                return(
                                                    <div key = {i}>
                                                        <RoomListItem writer={writer} group_id={params.group_id} room={room} />
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            }
                            <chakra.form onSubmit = {handleCreateRoom}>
                                <label>ルーム名</label>
                                <Input type="text" value={roomName} maxWidth={"300px"} margin={4} onChange={(e) => {setRoomName(e.target.value)}} />
                                <Select onChange={(evt) => handleRoomType(evt.target.value)} width={300} margin={4} marginTop={0}>
                                    <option value="quest">質問</option>
                                    <option value="talk">雑談</option>
                                    <option value="point">解説</option>
                                    <option value="other">その他</option>
                                </Select>
                                <Button type="submit" margin={4} marginTop={0}> 作成</Button>
                            </chakra.form>
                            <p>招待URL: {window.location.origin}/invite/{pageGroup.key}/{inviteID}</p>
                        </div>
                        <HomeMemberList>
                            <MembersList members={members} />
                        </HomeMemberList>
                    </div>
                </GroupBody>
            </>
        );
    }
}

