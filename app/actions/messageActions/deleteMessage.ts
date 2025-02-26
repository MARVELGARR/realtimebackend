import { Request, RequestHandler, Response } from 'express';
import { prisma } from '../../configs/prisma';
const deleteMessage: RequestHandler = async(req:Request, res: Response) => {
    const { messageId } = req.params;

    if(!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return
    }

    try{
        const deleteMessage =  await prisma.message.delete({
            where: { id: messageId }
        })

        if(deleteMessage){
            res.status(200).json({ message: 'Message deleted successfully' });
            return
        } else {
            res.status(500).json({ error: 'Failed to delete message' });
            return
        }
    }
    catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
}
 
export default deleteMessage;