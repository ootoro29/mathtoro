'use client'
import { useAuth } from "@/context/auth";
import styled from "@emotion/styled";
import Image from "next/image";
import { Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import { User } from "@/types/user";
import AddIcon from '@mui/icons-material/Add';
import { Group } from "@/types/group";

const Navi = styled.div`
    @media (max-width:834px){
        display:none;
    }
    display:block;
    width:300px;
    height:100%;
    display:flex;
    flex-direction:column;
    border: 0.5 solid gray
    
`;


export const NaviBar = ({currentUserPhotoURL, userName,groups}:{currentUserPhotoURL:string,userName:string,groups:Group[]}) => {
    const user = useAuth() as User;
    return(
        <Navi style={{width:300}}>
            <Box bg={"gray.300"} >
                <Link href={"/home"}>
                    <Box style = {{height:"60px",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                        <p style={{fontSize:20}}>Home</p>
                    </Box>
                </Link>
            </Box>
            <Box style={{flexGrow:1,display:"flex",flexDirection:"column"}} bg="gray.100" >
                <Box style={{flexGrow:1, overflowY:"scroll",minHeight:0,flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
                    {
                        groups.map((group:Group,i) => (
                            <Link href={`/home/group/${group.key}`} key = {i} >
                                <div style={{background:"white",height:"57px",borderRadius:"5%",margin:8,overflow:"hidden"}}  >
                                    <p>{group.name}</p>
                                </div>
                            </Link>
                        ))
                    }
                </Box>
                <Link href={`/home/group/newgroup`}>
                    <Box style={{height:"50px",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
                        <Button style={{width:"80%"}}
                         bg="lightgreen" 
                         _hover = {{
                            background: "green.100",
                        }}
                        >
                            <AddIcon />
                        </Button>
                    </Box>
                </Link>
            </Box>
            <Link href={`/home/user/${user.id}`}>
                <Box style={{display:"flex",height:"55px",padding:5}} bg={"lightgray"} >
                    <img src={currentUserPhotoURL} alt="" width={48} height={48} style={{borderRadius:"50%"}} />
                    <p style={{fontSize:24, fontWeight:"bold", margin:3}}>{userName}</p>
                </Box>
            </Link>
        </Navi>
    );
}