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

  const searchQuery = req.query.searchQuery as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;

  const skip = (page - 1) * limit;

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
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });
    const totalMessages = await prisma.message.count({
        where: {
            conversationId: conversationId,
            
        },
        
      })
      const totalPages = Math.ceil(totalMessages / limit)
        const hasNextPage = page < totalPages
        const nextPage  = groupMessages.length === limit;

        
     
    if (groupMessages) {
        res.status(200).json({
            GroupMessages: groupMessages,
            pagination: {
                currentPage: page,
                totalPages,
                hasNextPage,
                totalMessages,
                nextPage,
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
    return;
  }
};

export default getGroupMessages;
