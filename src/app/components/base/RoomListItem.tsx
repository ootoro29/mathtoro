import { Room } from "@/types/room";
import { background, Button, calc } from "@chakra-ui/react";
import Link from "next/link";

function roomTypeToString(roomType:string):string{
    if(roomType === "quest"){
        return "質問";
    }
    if(roomType === "point"){
        return "解説";
    }
    if(roomType === "done"){
        return "完了";
    }
    if(roomType === "other"){
        return "その他";
    }
    if(roomType === "talk"){
        return "雑談";
    }
    return "";
}
export const RoomListItem = ({group_id,room}:{group_id:string,room:Room}) => {
    if(room.type=== "quest"){    
        return(
            <div style={{border:"rgba(255,0,0) solid 2.5px",maxWidth:"100%",height:"60px",margin:4,display:"flex"}}  >
                <div style={{flexGrow:1,minWidth:0}} >
                    <p style={{fontSize:24,maxWidth:"100%",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{room.title}</p>
                    <p style={{fontSize:10,maxWidth:"100%",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>writer: {room.writer.name} type: {roomTypeToString(room.type)}</p>
                </div>
                <div style={{margin:4,marginTop:8}}>
                    <Link href={`/home/group/${group_id}/${room.id}`}>
                        <Button background={"red.200"} _hover={{background:"red.100"}}>入場</Button>
                        
                    </Link>
                </div>
            </div>
        );
    }else if(room.type=== "done"){    
        return(
            <div style={{border:"rgba(0,200,0) solid 2.5px",width:"95%",float:"left",height:"60px", padding:2,margin:4,flexShrink:0,display:"flex"}}  >
                <div style={{flexGrow:1}}>
                    <p style={{fontSize:25,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{room.title}</p>
                    <p style={{fontSize:12,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>writer: {room.writer.name} type: {roomTypeToString(room.type)}</p>
                </div>
                <div style={{display:"flex",flexDirection:"column"}}>
                    <div style={{flexGrow:1}}>
    
                    </div>
                    <div style={{margin:8}}>
                        <Link href={`/home/group/${group_id}/${room.id}`}>
                            <Button background={"green.200"} _hover={{background:"green.100"}}>入場</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    return(
        <div style={{border:"gray solid 2.5px",width:"95%",float:"left",height:"60px", padding:2,margin:4,flexShrink:0,display:"flex"}}  >
            <div style={{flexGrow:1}}>
                <p style={{fontSize:24,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{room.title}</p>
                <p style={{fontSize:10,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>writer: {room.writer.name} type: {roomTypeToString(room.type)}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{flexGrow:1}}>

                </div>
                <div style={{margin:8}}>
                    <Link href={`/home/group/${group_id}/${room.id}`}>
                        <Button background={"gray.200"} _hover={{background:"gray.100"}}>入場</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}