'use client'

import { ReactNode, useEffect } from "react";

export const ChatBody = ({children}: {children:ReactNode}) => {
    return(//flexShrink:0
        <> 
            <div id="chat-area" style={{background:"white",maxWidth:"100%",minHeight:0,maxHeight:"100%",flexGrow:1,overflowY:"scroll",flexBasis:0,scrollbarWidth:"none",msOverflowStyle:"none"}}>
                {children}
            </div>
        </>
    );
}