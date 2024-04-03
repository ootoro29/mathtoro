'use client'
import { useEffect, useState } from "react";
import { NaviBar } from "../components/base/NaviBar";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { getDatabase, onChildAdded, onValue, ref } from "firebase/database";
import { FirebaseError } from "firebase/app";
import { Group } from "@/types/group";
import { Box } from "@chakra-ui/react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const user = useAuth();
  const [groups,setGroups] = useState<Array<Group>>([]);

  useEffect(() => {
    try {
        if(!user)return;
        const db = getDatabase()
        const dbUserGroupRef = ref(db,`userGroups/${user.id}`)
        return onChildAdded(dbUserGroupRef,(snapshot) => {
          const dbGroupRef = ref(db, `groups/${snapshot.key}`)
          onValue(dbGroupRef, (snapshot) => {
              const key = snapshot.key||"";
              const value = snapshot.val();
              setGroups((prev) => [...prev,{key:key,name:value.name}])
          })
        })
    } catch (e) {
        if (e instanceof FirebaseError) {
            console.error(e)
        }
        return
    }
  },[user]);
  if(user){
    return (
      <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100%"}}>
          <div style={{background:"black",color:"white",width:"100%",height:"25px",fontSize:18}}>Mathtoro</div>
          <Box style={{display:"flex",flexGrow:1,minWidth:0}}>
              <div>
                <NaviBar currentUserPhotoURL={user.photoURL} userName={user.name} groups={groups} />
              </div>
              <Box style={{flexGrow:1,display:"flex",flexDirection:"column",maxWidth: "100%"}} >
                  {children}
              </Box>
          </Box>
      </div>    
    );
  }else if(user === null){
    router.push("/");
  }
}
/*

*/