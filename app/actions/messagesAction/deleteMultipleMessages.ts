import { prisma } from "../../configs/prisma";

const DeleteMultipleMessage = async ( messagesIds: string[] ) => {

    try{
        const deleteMessages = await prisma.message.deleteMany({
            where: {
                id: { in: messagesIds }
            }
        })
         if(!deleteMessages){
            throw new Error("Message not deleted")
        }

        return deleteMessages
    }
    catch(error){
        console.error("Error deleting multiple messages:", error);
    }
}
 
export default DeleteMultipleMessage;