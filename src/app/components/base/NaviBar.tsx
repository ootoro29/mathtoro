'use client'
/** @jsxImportSource @emotion/react */ 
import { useAuth } from "@/context/auth";
import styled from "@emotion/styled";
import Image from "next/image";
import { Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import { User } from "@/types/user";
import AddIcon from '@mui/icons-material/Add';
import { Group } from "@/types/group";
import { css } from "@emotion/react";
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';

//
const Navi =css`
    @media (max-width:834px){
        position:absolute;
        left:-250px;
        transform: translateX(0px);
        transition: all 300ms 0s ease-in-out;
        width:250px;
        height:calc(100% - 25px);
    }
    width:300px;
    height:100%;
    display:flex;
    flex-direction:column;
    border: 0.5 solid gray;
    z-index:10;
`;

const Navimove = css`
    @media (max-width:834px){
        transform: translateX(250px);
    }
`
const MenuButton = styled.div`
    @media (max-width:834px){
        display:block;
    }
    display:none;
    position:absolute;
    left:250px;
    color:white;
    background:black;
    width:60px;
    height:60px;
`



export const NaviBar = ({currentUserPhotoURL, userName,groups}:{currentUserPhotoURL:string,userName:string,groups:Group[]}) => {
    const user = useAuth() as User;
    const [open,setOpen] = useState(false);
    return(
        <div css={[Navi,open&&Navimove]}>
            <MenuButton onClick={() => setOpen(!open)} >
                {
                    (!open)&&<MenuIcon style={{fontWeight:"bold",fontSize:50,margin:5}} />
                }
                {
                    (open)&&<ClearIcon style={{fontWeight:"bold",fontSize:50,margin:5}} />
                }
            </MenuButton>
            <Box bg={"gray.300"} >
                <Link href={"/home"}>
                    <Box style = {{height:"60px",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                        <p style={{fontSize:20}}>Home</p>
                    </Box>
                </Link>
            </Box>
            <Box style={{flexGrow:1,display:"flex",flexDirection:"column"}} bg="gray.100" >
                <Box style={{flexGrow:1, overflowY:"scroll",maxHeight:"100%",minHeight:0,flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
                    {
                        groups.map((group:Group,i) => (
                            <Link href={`/home/group/${group.key}`} key = {i} >
                                <div style={{background:"white",height:"57px",borderRadius:"5%",margin:8,overflow:"hidden"}}  >
                                    <p>{group.name}</p>
                                </div>
                            </Link>
                        ))
                    }
                    <Link href={`/home/group/newgroup`}>
                        <Box style={{height:"50px",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
                            <Button style={{width:"95%"}}
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
            </Box>
            <Link href={`/home/user/${user.id}`} style={{height:"55px"}} >
                <Box style={{display:"flex",height:"100%",padding:5}} bg={"lightgray"} >
                    <img src={currentUserPhotoURL} alt="" width={48} height={48} style={{borderRadius:"50%"}} />
                    <p style={{fontSize:24, fontWeight:"bold", margin:3}}>{userName}</p>
                </Box>
            </Link>
        </div>
    );
}