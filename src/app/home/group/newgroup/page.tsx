"use client"
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { Group } from "@/types/group";
import { Box,Input,Button,chakra } from "@chakra-ui/react";
import { getDatabase, onChildAdded, push, ref, set } from "firebase/database";
import { FormEvent, useState } from "react";

export default function Page(){
    const user = useAuth();
    const [groupName,setGroupName] = useState("");
    const handleCreateGroup = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(groupName == "")return;
        if(!user)return;
        try{
            const db = getDatabase(); 
            const dbRef = ref(db, 'groups')
            await push(dbRef, {
                name: groupName,
            }).then(async(group) => {
                const dbGroupUserRef = ref(db,`groupUsers/${group.key}/${user.id}`);
                await set(dbGroupUserRef,{
                    name: user.name
                })
                const dbUserGroupRef = ref(db,`userGroups/${user.id}/${group.key}`);
                await set(dbUserGroupRef,{
                    name: groupName  
                })
            })
            setGroupName('')
        }catch(e){
            console.log(e);
        }
    }
    return (
        <>
            <GroupsHeader>
                <p style={{fontWeight:"bold",fontSize:20,margin:16}}>グループの新規作成</p>
            </GroupsHeader>
            <ChatBody>
                <Box style={{margin:2}}>
                    <chakra.form onSubmit = {handleCreateGroup}>
                        <label>グループ名</label>
                        <Input type="text" value={groupName} maxWidth={"300px"} margin={4} onChange={(e) => {setGroupName(e.target.value)}} />
                        <Button type="submit"> 作成</Button>
                    </chakra.form>
                </Box>
            </ChatBody>
        </>
    ); 
}