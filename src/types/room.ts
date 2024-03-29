import { User } from "./user";

export type Room = {
    id:string;
    title:string;
    writer:User;
}