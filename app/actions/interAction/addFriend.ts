import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";


const addFriend = async( req: Request, res:Response) => {

    const user = req.user 
    const {recepientId} = req.body
    if(!user){
        res.status(401).json({message: " Not logged in"})
        return
    }
    const userId = user.userId
    if(!recepientId){
        res.status(400).json({ message: "Recipient ID is required" });
        return;
    }
    try{
        
        const isFriend = await prisma.friend.findFirst({
            where: {
                userId,
                friendId: recepientId
            }
        })
        if(isFriend){
            res.status(200).json({message: "Already friends"})
        }

        const createFriends = await prisma.friend.create({
            data: {
                userId,
                friendId: recepientId,
            },
        })
        if(createFriends){
            res.status(203).json({message: "friendship created"})
        }
    }
    catch(error){
        res.status(500).json({error: "something went wrong"})
    }
    
}
 
export default addFriend;