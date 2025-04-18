import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";

const getGroupMessages: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  const { conversationId } = req.params;
  if (!user) {
    res.status(200).json({ message: "user not logged in" });
    return;
  }
  if (!conversationId) {
    res.status(404).json({ error: " conversationId is required" });
    return;
  }

  const cursor  = req.query.cursor  as string
  const limit = parseInt(req.query.limit as string) 

  try {
    const groupMessages = await prisma.message.findMany({
      where: {
        conversationId,
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

      const hasNextPage = groupMessages.length > limit;
      const nextCursor = hasNextPage ? groupMessages.pop()?.id : null;

        
     
    if (groupMessages) {
        res.status(200).json({
            GroupMessages: groupMessages,
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

export default getGroupMessages;
