import { Request, RequestHandler, Response } from 'express';
import { prisma } from '../../configs/prisma';

const updateMessage: RequestHandler = async (req: Request, res: Response) => {

    const {messageId} = req.params;
    const {message} = req.body;
    if(!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return
    }

    try{
        const updateMessage =  await prisma.message.update({
            where: { id: messageId },
            data: {
                content: message
            }
        })
        if(updateMessage){
            res.status(200).json({ message: 'Message updated successfully' });
        }
        else{
            res.status(400).json({ error: 'Message not found' });
        }
    }
    catch(error){
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
 
export default updateMessage;