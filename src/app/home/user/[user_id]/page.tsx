"use client"
import { ChatBar } from "@/app/components/base/ChatBar";
import { ChatBody } from "@/app/components/base/ChatBody";
import { GroupsHeader } from "@/app/components/base/GroupsHeader";
import { useAuth } from "@/context/auth";
import { db } from "@/lib/firebase/config";
import { User } from "@/types/user";
import { Box, Button } from "@chakra-ui/react";
import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page({params}:{params:{user_id:string}}){
    const user = useAuth() as User;
    const [pageUser,setPageUser] = useState<User>();
    const [pageUserName,setPageUserName] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const handlePageUser = async() => {
        const ref = doc(db,`users/${params.user_id}`);
        const snap = await getDoc(ref);
        if(snap.exists()){
            const appUser = (await getDoc(ref)).data() as User;
            setPageUser(appUser);
            setPageUserName(appUser.name);
        } else {
            router.back();
        }
    }
    const changeUserProf = async() => {
        if (!pageUser)return;
        if(user.id === pageUser.id){
            const ref = doc(db,"users",params.user_id);
            await updateDoc(ref,{'name':pageUserName});
        }
        window.location.reload();
    }
    useEffect(() => {
        handlePageUser();
    },[]);
    if(pageUser){
        return(
            <>
                <GroupsHeader>
                    <p style={{fontWeight:"bold",fontSize:20,margin:16}}>ユーザープロフィール/{pageUser.name}</p>
                    
                </GroupsHeader>
                <ChatBody>
                    <Box padding={8}>
                        <img src={pageUser.photoURL} alt="" width={100} height={100} style={{borderRadius:"50%"}} />
                        {
                            (user.id === pageUser.id)?(
                                <form onSubmit={changeUserProf}>
                                    <input type="text" value={pageUserName} onChange={(e) => {setPageUserName(e.target.value)}} />
                                    <Button type="submit">更新</Button>
                                    
                                </form>
                            ):(
                                <p>{pageUser.name}</p>
                            )
                        }
                    </Box>
                </ChatBody>
            </>
        );
    }
}