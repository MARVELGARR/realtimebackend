import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import corsOptions from "../configs/cors";
import sendMessageHandler from "./socketHandlers/send-message-handler";
import SocketDeleteSingleMessage from "./socketHandlers/delete-single-message-handler";
import deleteMultipleMessageSocket from "./socketHandlers/delete-multiple-messages-handlers";
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

const HEARTBEAT_TIMEOUT = 30000;

export function initializeSocket(server: any) {
  io = new Server(server, {
    cors: corsOptions,
    pingInterval: 10000,
    pingTimeout: 25000,
  });

  const onlineUsers = new Map<string, { socketId: string; lastSeen: number }>();

  io.on("connection", (socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`);

    socket.on("user-connected", (userId: string) => {
      onlineUsers.set(userId, { socketId: socket.id, lastSeen: Date.now() });

      // Notify just this socket
      socket.emit("isOnline", { isOnline: true });

      // Notify all sockets
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("heartbeat", (userId: string) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.set(userId, { socketId: socket.id, lastSeen: Date.now() });
      }
    });

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    sendMessageHandler(socket, io);
    SocketDeleteSingleMessage(socket, io);
    deleteMultipleMessageSocket(socket, io);

    socket.onAny((event, ...args) => {
      console.log(`📩 Event received: ${event}`, args);
    });

    socket.on("disconnect", () => {
      // Find and remove user by socketId
      const disconnectedUser = [...onlineUsers.entries()].find(
        ([, value]) => value.socketId === socket.id
      );

      if (disconnectedUser) {
        onlineUsers.delete(disconnectedUser[0]);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`❌ User ${disconnectedUser[0]} disconnected`);
      }
    });
  });

  // Cleanup inactive users every 10s
  setInterval(() => {
    const now = Date.now();
    let changed = false;

    for (const [userId, { lastSeen }] of onlineUsers.entries()) {
      if (now - lastSeen > HEARTBEAT_TIMEOUT) {
        console.log(`⚠️ Removing inactive user: ${userId}`);
        onlineUsers.delete(userId);
        changed = true;
      }
    }

    if (changed) {
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  }, 10000); // every 10s
}

