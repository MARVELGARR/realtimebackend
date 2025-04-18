import {Request, RequestHandler, Response} from "express";
import { prisma } from "../../configs/prisma";
const getFavourite: RequestHandler = async( req: Request, res: Response) => {

    const userId = req.user?.userId
    if(!userId){
        res.status(401).json({error: "Unauthorized"})
        return
    }
    try{

        const favourite = await prisma.starredMessage.findMany({
            where: {
                profile: {
                    user: {
                        id: userId
                    }
                },

            },
            include: {
                message: true,

                
            }
        })
        
        res.status(200).json({favourite})
        return

    }catch(error){
        console.error("Error fetching starred messages:", error);
        res.status(500).json({ error: "Internal server error" });
        return
    }
}
 
export default getFavourite;