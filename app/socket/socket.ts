import { Server } from "socket.io"
import dotenv from "dotenv"
import http from "http";
import corsOptions from "../configs/cors";

dotenv.config()
export let io: Server;


interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: string | null;
    image: string;
    password: string;
    createdAt: string;
    updatedAt: string;
  }
  
  interface StarredMessages {
    id: string;
    profileId: string;
    messageId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface GroupMessageProp {
  
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    type: "GROUP" | "DIRECT"; // Adjust as needed
    userId: string;
    conversationId: string;
    editableUntil: string;
    StarredMessage: StarredMessages[]; // Adjust if StarredMessage has a specific structure
    user: User;
  }

  export type sendMessageProp = {
    recepientId?: string,
    newMessage: GroupMessageProp,
}



export function initializeSocket(server: any){
    io = new Server(server, { cors: corsOptions });

    const userUnreadMessages = new Map<string, Map<string, GroupMessageProp[]>>();
    const userLastSeen = new Map<string, Date>();
    const connectedUserIdMap = new Map<string, string>();
    const connectedUserId = connectedUserIdMap.get("userId") 

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("connect", ({ userId, messages }: { userId: string, messages: Record<string, number> }) => {
            connectedUserIdMap.set(userId, socket.id);
          
            if (!userUnreadMessages.has(userId)) {
              userUnreadMessages.set(userId, new Map());
            }
          
            const userMessages = userUnreadMessages.get(userId);
          
            // Rehydrate unread count with empty placeholder messages (optional)
            Object.entries(messages).forEach(([senderId, count]) => {
              if (!userMessages?.has(senderId)) {
                const placeholderMessages = Array(count).fill(null); // or dummy objects if needed
                userMessages?.set(senderId, placeholderMessages);
              }
            });
          });
        
        socket.on("join-conversation", ({recepientId, userId})=>{
            socket.join(`${recepientId}:${userId}`)
        })
        socket.on("message-read", ({recepientId, userId})=>{
            const userMessages = userUnreadMessages.get(userId);
            if (userMessages) {
                userMessages.delete(recepientId);
                if (userMessages.size === 0) {
                    userUnreadMessages.delete(userId);
                }
            }
        })

        socket.on("send-message", async ({ recepientId, newMessage }: sendMessageProp) => {
            if (!recepientId) return;
          
            // 1. Update unread message map for the recipient
            const recipientMessages = userUnreadMessages.get(recepientId) || new Map();
            const existingMessages = recipientMessages.get(newMessage.userId) || [];
          
            existingMessages.push(newMessage);
            recipientMessages.set(newMessage.userId, existingMessages);
            userUnreadMessages.set(recepientId, recipientMessages);
          
            const unreadCount = existingMessages.length;
          
            // 2. Send the message to the room (for both sender and recipient)
            const roomName = `${recepientId}:${newMessage.userId}`;
            io.to(roomName).emit("receive-message", {
              ...newMessage,
            });
          
            // 3. Emit separate unread notification to the recipient directly
            const recipientSocketId = connectedUserIdMap.get(recepientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("unread-message", {
                from: newMessage.userId,
                unreadCount,
              });
            }
          });
          


        //groups
    
        socket.on("join-group-conversation", ({conversationId, groupId, userId }) => {
            socket.join(conversationId);
            console.log(userId, "Joined")
        });


        socket.on("send-group-message", async ({...prop}:GroupMessageProp) => {
            console.log(`Sending message to conversation ${prop.conversationId}: ${prop.content}`);
    
            
            io.to(prop.conversationId).emit("receive-group-message", { ...prop });
    
            // Save message to database

           
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
