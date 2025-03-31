import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";

const getMessages: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  const { recepientId } = req.params;
  if (!user) {
    res.status(200).json({ message: "user not logged in" });
    return;
  }
  if (!recepientId) {
    res.status(404).json({ error: " recepientId is required" });
    return;
  }

  const cursor  = req.query.cursor  as string
  const limit = parseInt(req.query.limit as string) 

  try {
    const Messages = await prisma.message.findMany({
      where: {
        conversation: {
            participants: {
                every:{
                    userId: { in: [
                        user.userId,
                        recepientId
                      ]}
                }
            }
        },
        type: "DIRECT"
      },
      include: {
        StarredMessage: {
          select: {
            id: true,
            profileId: true,
            messageId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: true,
      },
      take: limit + 1,
      orderBy: {
        createdAt: "desc"
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, 
    });

      const hasNextPage = Messages.length > limit;
      const nextCursor = hasNextPage ? Messages.pop()?.id : null;

        
     
    if (Messages) {
        res.status(200).json({
            Messages: Messages,
            pagination: {
                hasNextPage,
                nextCursor,
                limit
            }
      })
      return;
    } else {
      res.status(404).json([]);
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "something went wrong" });
    console.log(error)
    return;
  }
};

export default getMessages;
