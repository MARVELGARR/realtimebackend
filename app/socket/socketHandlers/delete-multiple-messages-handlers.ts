import { Server, Socket } from "socket.io";
import DeleteMultipleMessage from "../../actions/messagesAction/deleteMultipleMessages";
import { prisma } from "../../configs/prisma";

type messageIds = {
    messageIds: string[];
}
const deleteMultipleMessageSocket = (socket: Socket, io: Server) => {
    socket.on("delete-multiple-messages", async (messageIds: messageIds, conversationId: string, userId: string) => {
        
        try{
            console.log("Deleting messages:", messageIds);
            const messageConvoId = await prisma.message.findUnique({
                where: {
                    id: messageIds?.messageIds[0]
                },
                select:{conversationId: true}
            })
            const result = await DeleteMultipleMessage(messageIds?.messageIds)
            if(result){
                console.log()
                io.to(messageConvoId?.conversationId as string).emit("multiple-messages-deleted", {messageIds, userId});
            }
        }
        catch(error){
            console.error("❌ Error deleting messages:", error);
            socket.emit("message-error", "Could not delete messages");
        }
    })
}
 
export default deleteMultipleMessageSocket;