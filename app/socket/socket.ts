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


  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.onAny((event, ...args) => {
      console.log(`📩 Event received: ${event}`, args);
    });

    socket.on("join-conversation", ({ roomId}) => {
      socket.join(roomId);
      
      console.log(`👥 User joined room: ${roomId}`);
    });

    socket.on(
      "send-message",
      ({ roomId, newMessage }: { roomId: string; newMessage: MessageProp }) => {
        io.to(roomId).emit("receive-message", newMessage);
        console.log(`📤 Sent message to room ${roomId}: ${newMessage.content}`);
      }
    );

    //groups

    socket.on(
      "join-group-conversation",
      ({ conversationId, groupId, userId }) => {
        socket.join(conversationId);
        console.log(userId, "Joined");
      }
    );

    socket.on("send-group-message", async ({ ...prop }: GroupMessageProp) => {
      console.log(
        `Sending message to conversation ${prop.conversationId}: ${prop.content}`
      );

      io.to(prop.conversationId).emit("receive-group-message", { ...prop });

      // Save message to database
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: ", socket.id);
    });


  });
}
