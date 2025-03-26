import { Server } from "socket.io"
import dotenv from "dotenv"
import http from "http";
import corsOptions from "../configs/cors";

dotenv.config()
export let io: Server;


export function initializeSocket(server: any){
    io = new Server(server, { cors: corsOptions });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        
    
        socket.on("join-conversation", ({conversationId, groupId, userId }) => {
            socket.join(conversationId);
            console.log(userId, "Joined")
        });
        socket.on("send-group-message", async ({userId, conversationId, groupId,message}) => {
            console.log(`Sending message to group ${groupId}: ${message}`);
    
            
            io.to(conversationId).emit("receive-group-message", { message, userId });
    
            // Save message to database

           
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
