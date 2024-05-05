import { Room } from "./room";
import { Image } from "./image";
import { User } from "./user";

export type Message = {
    key:string;
    sender_id:string;
    room:Room;
    body:string;
    type:"chat" | "formula";
    images:string[];
};


export type MessageList = {
    message:Message;
    sendUserKey:string;
};