'use client'

import { Dispatch, ReactNode, SetStateAction } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import styled from "@emotion/styled";
import { Box, Button } from "@chakra-ui/react";
const Header = styled.div`
    @media (max-width:834px){
        margin-left:55px;
    }
    margin-left:0px;
`

export const GroupsHeader = ({children}: {children:ReactNode}) => {
    return(
        <Box style={{height:"60px",display:"flex"}} bg={"lightgray"} >
            <Header>
                {children}
            </Header>
        </Box>
    );
}