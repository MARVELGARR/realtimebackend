import { prisma } from "../../configs/prisma";


const DeleteSingleMessage = async({messageId}: { messageId: string}) => {

    try{
        const deletedMessage = await prisma.message.delete({
            where: {
                id: messageId
            }
        })

        if(!deletedMessage){
            throw new Error("Message not deleted")
        }

        return deletedMessage
    }
    catch(error){
        console.error("Error deleting message:", error);
    }
}
 
export default DeleteSingleMessage;