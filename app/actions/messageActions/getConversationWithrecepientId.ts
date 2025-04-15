import { Request, Response, RequestHandler } from 'express';
import { prisma } from '../../configs/prisma';

const getConversationWithrecepientId: RequestHandler = async( req: Request, res: Response) => {

    const { recepientId } = req.query;
    const user = req.user;

    if(!user){
        res.status(401).json({error: 'Unauthorized'})
        return;
    }

    try{
        const conversation = await prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        userId: {
                          in: [user.userId as string, recepientId as string]
                        }
                    }
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
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
                unreadStates: {
                    where: {
                        userId: user.userId as string
                    },
                    select: {
                        unreadCount: true,
                        userId: true,
                    }
                }
            }
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
        res.status(500).json({error: 'Internal Server Error'})
        return
    }
}
 
export default getConversationWithrecepientId;