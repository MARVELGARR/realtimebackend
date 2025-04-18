import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";

const getUnreadMessageCount = async (req:Request, res: Response) => {

    const userId = req.user?.userId

    try{
        const unReadMessageCount = await prisma.conversation.count({
            where:{
                participants: {
                    some: {
                        userId
                    }
                },
                unreadStates: {
                    some: {
                        userId,
                        unreadCount: {
                            not: 0
                        }
                    },

                }
            }
        })

        res.status(200).json(unReadMessageCount)
        return
        
    }
    catch(error){
        console.error("Error fetching unread message count:", error);
        res.status(500).json({ error: "Internal server error" });
        return
    }
}
 
export default getUnreadMessageCount;