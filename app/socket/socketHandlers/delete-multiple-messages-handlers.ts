import { Server, Socket } from "socket.io";
import DeleteMultipleMessage from "../../actions/messagesAction/deleteMultipleMessages";

const deleteMultipleMessageSocket = (socket: Socket, io: Server) => {
    socket.on("delete-multiple-messages", async (messageIds: string[], conversationId: string, userId: string) => {
        const convoId = conversationId;
        try{
            const result = await DeleteMultipleMessage(messageIds)
            if(result){
                console.log(convoId)
                io.to(convoId as string).emit("messages-deleted", {messageIds, userId});
            }
        }
        catch(error){
            console.error("❌ Error deleting messages:", error);
            socket.emit("message-error", "Could not delete messages");
        }
    })
}
 
export default deleteMultipleMessageSocket;