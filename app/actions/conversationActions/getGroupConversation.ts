import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const getGroupConversation: RequestHandler = async( req: Request, res: Response) => {

    const user = req.user
    const {conversationId} = req.params
    if(!user){
        res.status(401).json({message: "user not logged in"})
    }

    if(!conversationId){
        res.status(404).json({message: "requires conversationId, conversationId not found"})
    }
    
    try{
        const conversation =  await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                messages: {
                    include: {
                        user: true,
                        StarredMessage: true
                    }
                },
                participants: { 
                    include: {
                        user: {
                            select: {
                                id: true,
                                image: true,
                                name: true,
                                profile: true
                            }
                        }
                    },
                    distinct: ['userId'],
                },
                group: {
                    select: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                image: true,

                            }
                        },
                        creator: {
                            select:{
                                id: true,
                                name: true,
                                image: true
                            }
                        },
                        disappearingMessages: true,
                        groupImage: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        id: true
                    }
                }
            },
    
        })

        if(conversation){
            res.status(200).json(conversation)
            return
        }else{
            res.status(404).json([])
            return
        }
    }
    catch(error){
        res.status(500).json({error: "something went wrong"})
        return
    }
}
 
export default getGroupConversation;