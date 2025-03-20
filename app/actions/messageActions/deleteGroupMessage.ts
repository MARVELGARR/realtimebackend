
import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";

const deleteGroupMessages: RequestHandler = async (req: Request,res: Response) => {

    const user = req.user
    if(!user){
        res.status(401).json({message: " Not logged in"})
        return
    }

    const {messageIds}: {messageIds: string[]} = req.body

    if(!messageIds){
        res.status(404).json({error: "messageIds not found"})
        throw new Error("messageIds not found")
    } 

    try{
        const result = await prisma.message.deleteMany({
            where: {
                id: { in: messageIds }
            },
        })
        if(result){
            res.status(200).json({message: "messages deleted"})
        }
    }
    catch(error){
        res.status(500).json({ error: error });
        return;
      
    }

}
 
export default deleteGroupMessages;