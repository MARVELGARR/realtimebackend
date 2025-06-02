import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const getConvoDetails: RequestHandler = async (req: Request, res: Response) => {

        const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const {conversationId} = req.params

    if(!conversationId){
        res.status(401).json({error: "conversatioId is required"})
    }
    
    try{
        const data = await prisma.conversation.findUnique({
            where:{
                id: conversationId
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                profile: {
                                    select: {
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        groupImage: true,
                        descriptions: true,
                        adminId: true,
                        disappearingMessages: true,
                        createdAt: true,
                        updatedAt: true,
                        
                    }
                }
            }
        })
        res.status(200).json(data)
        return
    }
    catch(error){
         console.error("Error getting convo details:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}
 
export default getConvoDetails;