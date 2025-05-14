import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import corsOptions from "../configs/cors";

dotenv.config();
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
  type: "GROUP"; // Adjust as needed
  userId: string;
  conversationId: string;
  editableUntil: string;
  StarredMessage: StarredMessages[]; // Adjust if StarredMessage has a specific structure
  user: User;
}
export interface MessageProp {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: "DIRECT"; // Adjust as needed
  userId: string;
  conversation: {
    id: string;
  };
  editableUntil: string;
  StarredMessage: StarredMessages[]; // Adjust if StarredMessage has a specific structure
  user: User;
}

export type sendMessageProp = {
  recepientId?: string;
  newMessage: GroupMessageProp;
};

export function initializeSocket(server: any) {
  io = new Server(server, { cors: corsOptions });


  const onlineUsers = new Map<string, string>()
  io.on("connection", (socket) => {
    
    socket.on("user-connected",(userId: string)=>{
      onlineUsers.set(socket.id, userId)

      //Informs the loggedin user he/she is online
      socket.emit('isOnline', {isOnline: true})
      const onlineUserIds = Array.from(onlineUsers.values());
      
      io.emit("online-users", onlineUserIds )
    })
    

    


    socket.onAny((event, ...args) => {
      console.log(`📩 Event received: ${event}`, args);
    });


    socket.on("disconnect", () => {
      
      onlineUsers.delete(socket.id);
      io.emit("online-users", Array.from(onlineUsers.values()));
    });
  });
}
