import { Server, Socket } from "socket.io";
import DeleteSingleMessage from "../../actions/messagesAction/deleteSingleMessage";


const SocketDeleteSingleMessage = (socket: Socket, io: Server) => {
    socket.on("delete-single-message", async (messageId, conversationId, userId) =>{
        try{
           const result = await DeleteSingleMessage(messageId)
           if(result){
            console.log(result.conversationId)

               io.to(result.conversationId as string).emit("message-deleted", {messageId, userId});
           }
        }
        catch(error){
            console.error("❌ Error deleting message:", error);
            socket.emit("message-error", "Could not delete message");
        }
    } )
}
 
export default SocketDeleteSingleMessage;