import { Room } from "./room";
import { User } from "./user";

export type Message = {
    key:string;
    sender:User;
    room:Room;
    body:string;
    type:"chat" | "formula";
};