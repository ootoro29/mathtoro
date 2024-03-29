'use client'

import { ReactNode } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import styled from "@emotion/styled";
import { Box } from "@chakra-ui/react";
const NaviMenu = styled.div`
    @media (max-width:834px){
        display:block;
    }
    display:none;
`

export const GroupsHeader = ({children}: {children:ReactNode}) => {
    return(
        <Box style={{height:"60px",display:"flex"}} bg={"lightgray"} >
            <NaviMenu>
                <MenuIcon style={{margin:2, fontSize:"24px"}} />
            </NaviMenu>
            {children}
        </Box>
    );
}