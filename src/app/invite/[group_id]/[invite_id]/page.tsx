"use client"
import { useAuth } from "@/context/auth";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Button } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { getDatabase, onChildAdded, onValue, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page({params}:{params:{group_id:string,invite_id:string}}){
    const invite_user = useAuth() as User;
    const router = useRouter();
    const [exist,setExist] = useState<Boolean|null>();
    const [group,setGroup] = useState<string>();
    const [need,setNeed] = useState<Boolean>(false);
    useEffect(() => {
        if(!invite_user)return;
        try {
            const rdb = getDatabase()
            const rdbRef = ref(rdb,`invites/${params.group_id}/${params.invite_id}`)
            return onValue(rdbRef,(snapshot) => {
                setExist(snapshot.exists());
                setGroup(snapshot.val().name);
            })
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.error(e)
            }
            router.back();
            return;
        }
    },[invite_user]);
    useEffect(() => {
        if(!invite_user)return;
        if(!exist)return;
        const rdb = getDatabase()
        const dbConfirmRef = ref(rdb,`userGroups/${invite_user.id}/${params.group_id}`);
        onValue(dbConfirmRef,(snapshot) => {
            setNeed(!snapshot.exists());
        })    
    },[exist])

    const handleJoinGroup = async() => {
        if(!invite_user)return;
        const rdb = getDatabase()
        const dbGroupUserRef = ref(rdb,`groupUsers/${params.group_id}/${invite_user.id}`);
        await set(dbGroupUserRef,{
            exist: true
        })
        const dbUserGroupRef = ref(rdb,`userGroups/${invite_user.id}/${params.group_id}`);
        await set(dbUserGroupRef,{
            exist: true  
        })
        window.location.assign(`/home/group/${params.group_id}`);
    }

    /*
    useEffect(() => {
        if(!user)return;
        if(confirm === null)return;
        const rdb = getDatabase()
        try{
            if(confirm){
                const setUserGroup = async() => {
                    const dbGroupUserRef = ref(rdb,`groupUsers/${params.group_id}/${user.id}`);
                    await set(dbGroupUserRef,{
                        exist: true
                    })
                    const dbUserGroupRef = ref(rdb,`userGroups/${user.id}/${params.group_id}`);
                    await set(dbUserGroupRef,{
                        exist: true  
                    })
                }
                setUserGroup();
                router.replace(`/home/group/${params.group_id}`);
            }else{
                router.replace(`/home/group/${params.group_id}`);
            }
        }catch(e){
            console.log(e);
        }
    },[confirm]);
    */
    if(exist&&group){
        return (  
            <>
                <p>グループ名:{group}</p>
                {
                    (need)?(
                        <Button onClick={handleJoinGroup}>
                            参加する
                        </Button>
                    ):(
                        <Button onClick={() => {window.location.assign(`/home/group/${params.group_id}`)}}>
                            参加済
                        </Button>
                    )
                }
            </>
        );
    }
}