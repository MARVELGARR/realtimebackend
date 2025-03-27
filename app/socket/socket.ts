import { Server } from "socket.io"
import dotenv from "dotenv"
import http from "http";
import corsOptions from "../configs/cors";

dotenv.config()
export let io: Server;


export type groupMessageProp ={

    conversationId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    type: "DIRECT" | "GROUP";
    content: string;
    editableUntil: Date;
}

export function initializeSocket(server: any){
    io = new Server(server, { cors: corsOptions });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        
    
        socket.on("join-conversation", ({conversationId, groupId, userId }) => {
            socket.join(conversationId);
            console.log(userId, "Joined")
        });
        socket.on("send-group-message", async ({...prop}:groupMessageProp) => {
            console.log(`Sending message to conversation ${prop.conversationId}: ${prop.content}`);
    
            
            io.to(prop.conversationId).emit("receive-group-message", { ...prop });
    
            // Save message to database

           
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
