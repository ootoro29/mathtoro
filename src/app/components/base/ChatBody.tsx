'use client'

import { ReactNode, useEffect } from "react";

export const ChatBody = ({children}: {children:ReactNode}) => {
    return(
        <> 
            <div id="chat-area" style={{background:"white",flexGrow:1,overflowY:"scroll",minHeight:0,flexShrink:0,flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
                {children}
            </div>
        </>
    );
}