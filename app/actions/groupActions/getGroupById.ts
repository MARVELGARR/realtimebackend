
import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";

const getGroupById: RequestHandler = async(req: Request, res: Response) => {

    const user = req.user
    const {groupId} = req.params
    if(user){
        res.status(200).json({message: "user not logged in"})
        return
    }
    if(!groupId){
        res.status(404).json({error: " groupId is required"})
        return
    }

    try{
        const group = await prisma.group.findUnique({
            where: {id: groupId},
            include: {
                admin: true,
                creator: true,
                participants: true,
            }
        })
        if(group){
            res.status(200).json(group)
            return
        }
        else{
            res.status(404).json([])
            return
        }
    }
    catch(error){
        res.status(500).json({error: "something went wrong"})
        return
    }
    
}
 
export default getGroupById;