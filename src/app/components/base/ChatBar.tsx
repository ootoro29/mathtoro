'use client'
import { useAuth } from "@/context/auth";
import { Box, Button, chakra, Input } from "@chakra-ui/react";
import { getDatabase, push, ref, set } from "firebase/database";
import { Dispatch, FormEvent, SetStateAction } from "react";
export const ChatBar = ({room_id,message,setMessage}:{room_id:string,message:string,setMessage: Dispatch<SetStateAction<string>>}) => {
    const user = useAuth();
    const handleCreateMessage = async(e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!user)return;
        if(message.replace(" ","").replace("　","")==="")return;
        try{
            const rdb = getDatabase();
            const messageRef = ref(rdb,`messages`);
            await push(messageRef, {
                body: message,
                sender_id:user.id,
                room_id: room_id
            }).then(async(message) => {
                const dbRoomMessagesRef = ref(rdb,`roomMessages/${room_id}/${message.key}`);
                await set(dbRoomMessagesRef,{
                    exist: true
                })
                const dbUserMessagesRef = ref(rdb,`userMessages/${user.id}/${message.key}`);
                await set(dbUserMessagesRef,{
                    exist: true
                })
            })
            setMessage('')
            return
        }catch(e){
            console.log(e);
            return
        }
    }
    return(
        <Box bg = "gray.200" height={"60px"}>
            <chakra.form onSubmit = {handleCreateMessage}>
                <Box height={"30px"} style={{display:"flex",margin:10}}>
                    <Input value={message} onChange = {(e) => {setMessage(e.target.value)}} style={{border:"black solid 1px",background:"white"}}></Input>
                    <Button type="submit" style={{border:"black solid 1px"}}>送信</Button>
                </Box>
            </chakra.form>
        </Box>
    );
}