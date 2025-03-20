import { PrismaClient } from "@prisma/client";
import { Response, Request, RequestHandler } from "express";

const prisma = new PrismaClient();

export const getAndFilterChats: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  if (!user) {
    res.status(400).json({ error: "User not authenticated" });
    return;
  }

  const searchTerm = req.query.searchTerm as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = searchTerm
      ? {
          OR: [
            {
              participants: {
                some: {
                  user: {
                    OR: [
                      { name: { contains: searchTerm, mode: "insensitive" } },
                      {
                        profile: {
                          OR: [
                            {
                              firstName: {
                                contains: searchTerm,
                                mode: "insensitive",
                              },
                            },
                            {
                              lastName: {
                                contains: searchTerm,
                                mode: "insensitive",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              group: {
                name: { contains: searchTerm, mode: "insensitive" },
              },
            },
          ],
        }
      : {};

    const conversations = await prisma.conversation.findMany({
      where: {
        ...whereClause,
        participants: {
          some: {
            user: {
              profile: {
                blockedUsers: {
                  none: {
                    blockedId: user.profile?.id,
                  },
                },
              },
            },
          },
        },
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
                friends: true,
                profile: {
                  select: {
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
        group: true,
        StarConversation: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.conversation.count({
      where: {
        ...whereClause,
        participants: {
          some: {
            user: {
              profile: {
                blockedUsers: {
                  none: {
                    blockedId: user.profile?.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    const directConversations = conversations.filter(
      (convo) => convo.participants.length === 2 && !convo.groupId
    );

    const groupConversations = conversations
      .filter((convo) => convo.participants.length > 2 && convo.groupId)
      .map((item) => item.group);

    const friendConvo = directConversations.filter((convo) => !convo.groupId &&
      convo.participants.find((parti) => parti.userId !== user.userId)?.user.friends.filter((cri)=>{
        cri.userId === user.userId
      })
    );

    const favouriteConvo = conversations.filter((convo) =>
      convo.StarConversation.some((star) => star.userId === user.userId)
    );

    res.json({
      directConversations,
      groupConversations,
      friendConvo,
      favouriteConvo,
      totalResults: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({
      error: "An error occurred while searching",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
