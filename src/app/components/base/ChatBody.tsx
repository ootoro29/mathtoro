'use client'

import { ReactNode } from "react";

export const ChatBody = ({children}: {children:ReactNode}) => {
    return(
        <div style={{background:"white",flexGrow:1,overflowY:"scroll",minHeight:0,flexShrink:0,flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
            {children}
        </div>
    );
}