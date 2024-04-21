'use client'

import { ReactNode, useEffect } from "react";

export const GroupBody = ({children}: {children:ReactNode}) => {
    return(
        <> 
            <div id="chat-area" style={{background:"white",maxWidth:"100%",minHeight:0,maxHeight:"100%",flexGrow:1,overflowY:"scroll",flexShrink:0,flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
                {children}
            </div>
        </>
    );
}