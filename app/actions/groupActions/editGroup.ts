import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";



const editGroup: RequestHandler = async(req: Request, res:Response) => {
    const user = req.user
    const {groupId} = req.params
    const name = req.body.name
    const description = req.body.description
    const groupImage = req.body.image
    const disappearingMessages = req.body.disappearingMessages
    if(!user){
        res.status(200).json({message: "user not logged in"})
        return
    }
    if(!groupId){
        res.status(404).json({error: " groupId is required"})
        return
    }
    try{
        const group = await prisma.group.update({
            where: {id: groupId},
            data: {
                name,
                groupImage,
                descriptions: description,
                disappearingMessages,                
            }
        })
        res.status(200).json(group)
        return
    }
    catch(error){
        res.status(500).json({error: "something went wrong"})
        return
    }
}
 
export default editGroup;