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
    const whereClause: any = searchTerm && searchTerm.trim() !== "" 
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
                blockedBy: {
                  none: {
                    blockerId: user.profile?.id,
                  },
                },
              }
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
        unreadStates: {
          where: {
              userId: user.userId as string
          },
          select: {
              unreadCount: true,
              userId: true,
          }
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

    const directConversations = conversations.filter((convo) => {
      return !convo.groupId;
    });

    const groupConversations = conversations
    .filter((convo) => convo.groupId !== null && convo.groupId !== undefined)
    .map((item) => ({ id: item.id, group: item.group }));

    const friendConvo = directConversations.filter((convo) => {
      // Find the other participant in this conversation
      const otherParticipant = convo.participants.find(p => p.userId !== user.userId);
      
      // Check if this person  is a friend of the current user
      return otherParticipant && otherParticipant.user.friends.some(f => f.friendId === user.userId);
    });

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
