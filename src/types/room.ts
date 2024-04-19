import { RoomType } from "./roomtype";
import { User } from "./user";

export type Room = {
    id:string;
    title:string;
    writer:User;
    type:string;
}