import { Server, Socket } from "socket.io";
import sendMessage from "../../actions/messagesAction/sendMessage";
const sendMessageHandler = (socket: Socket, io: Server) => {
  socket.on(
    "send-message",
    async ({
      conversationId,
      conversationType,
      message,
      receiverId,
      currentUserId,
    }: {
      conversationId?: string;
      conversationType: "DIRECT" | "GROUP";
      message: string;
      receiverId: string;
      currentUserId: string;
    }) => {
      try {
        const result = await sendMessage({
          conversationId,
          conversationType,
          message,
          receiverId,
          currentUserId,
        });
        io.to(conversationId! as string).emit("receive-message", result);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("message-error", "Could not send message");
      }
    }
  );
};

export default sendMessageHandler;
