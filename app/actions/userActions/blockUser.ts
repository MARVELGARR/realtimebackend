import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const blockUser: RequestHandler = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const {recieverId} = req.params

    if(!recieverId){
        res.status(400).json({message: "ReceiverId is required"})
    }

    try{
        const block = await prisma.block.create({
            data: {
                blockerId: user.userId,
                blockedId: recieverId
            }
        })

        res.status(201).json(block)
        return 
    }
    catch(error){
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
    
}
 
export default blockUser;