import { Room } from "./room";
import { User } from "./user";

export type Message = {
    key:string;
    sender_id:string;
    room:Room;
    body:string;
    type:"chat" | "formula";
};


export type MessageList = {
    message:Message;
    sendUserKey:string;
};