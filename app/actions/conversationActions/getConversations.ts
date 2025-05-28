import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const getConversations: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { limit, offset, searchTerm = "" } = req.query;

  

  const [conversations, totalCount] = await Promise.all([
    prisma.conversation.findMany({
      skip: Number(offset) || 0,
      take: Number(limit) || 10,
where: {
  participants: {
    some: {
      
      userId: user.userId,
    },
  },
  conversationType: { in: ["DIRECT", "GROUP"] }, // Only needed if you want to be explicit
  OR: [
    {
      participants: {
        some: {
          user: {
            name: {
              contains: searchTerm as string,
              mode: "insensitive",
            },
          },
        },
      },
    },
    {
      group: {
        name: {
          contains: searchTerm as string,
          mode: "insensitive",
        },
      },
    },
  ],
},
      include: {
        group:true,
        unreadStates: {
          select: {
            unreadCount: true,
            userId: true,
            lastReadAt: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
                
              },
            
            },
          },

        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),


    prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: user.userId,
          },
        },
        OR: [
          {
            participants: {
              some: {
                user: {
                  name: {
                    contains: searchTerm as string,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            group: {
              name: {
                contains: searchTerm as string,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    }),
  ]);

  res.status(200).json({
    conversations,
    totalCount,
  });
  return;
};

export default getConversations;
