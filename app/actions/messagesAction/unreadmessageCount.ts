import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const unreadMessageCount: RequestHandler = async(req: Request,
    res: Response) => {
        const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try{
    const conversation = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                  
                  userId: user.userId,
                },
              },
        },
        select: {
            unreadStates: {
                select: {
                  unreadCount: true,
                  userId: true,
                  lastReadAt: true,
                },
              },
        }
    })
    const unreadStates = conversation.flatMap((item)=>item.unreadStates)
    const unreadcount = unreadStates.find((item)=>item.userId == user.userId)?.unreadCount
    res.status(200).json(unreadcount)
  }

  catch (error) {
    console.error("Error accepting friend requests:", error);
    res.status(500).json({error: "failed to get conversation count"})
  }
}
 
export default unreadMessageCount;