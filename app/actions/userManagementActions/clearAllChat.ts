import {Request, RequestHandler, Response} from "express"
import { prisma } from "../../configs/prisma"

const clearAllChats: RequestHandler = async (req: Request, res: Response) => {

    const { userId } = req.params

    if(!userId){
        res.status(400).json({error: "No userId not found"})
        return
    }
    if(userId === "null" || userId == null){
        res.status(400).json({error: "userId null"})
        return
    }

    try{
        const clearMessage =  await prisma.message.deleteMany({
            where: { userId}
        })

        if(clearMessage){
            res.status(200).json({message: 'All message Cleared'})
            return
        }
        else{
            res.status(500).json({error: 'something wentwrong'})
            return
        }
    }
    catch(error){
        res.status(500).json({error: "Seomething went wrong"})
        return
    }
}
 
export default clearAllChats;