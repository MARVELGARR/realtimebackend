import { Request, RequestHandler, Response } from 'express';
import { prisma } from '../../configs/prisma';
const deleteGroupMessage: RequestHandler = async(req:Request, res: Response) => {
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
            res.status(404).json({ error: 'message not found ' });
            return
        }
    }
    catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
}
 
export default deleteGroupMessage;