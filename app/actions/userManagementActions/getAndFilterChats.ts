import { PrismaClient, ChatType } from "@prisma/client";
import { Response, Request, RequestHandler } from "express";

const prisma = new PrismaClient();

interface SearchResponse {
  users: any[];
  conversations: any[];
  groups: any[];
  totalResults: number;
}

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
    // If no search term, return recent conversations
    if (!searchTerm || searchTerm === '') {
      const conversations = await prisma.conversation.findMany({
        orderBy: {
          updatedAt: "desc",
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
              }
            },
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          group: {
            include: {
              participants: true,
              Conversation: true
            }
          },
          StarConversation:true
        },
        take: limit,
        skip: skip,
      });

      const total = await prisma.conversation.count();
      const directConversations = conversations.filter((convo)=>convo.participants.length === 2)

      const groupConversations = conversations.filter((convo)=>convo.participants.length > 2).map((group)=>group.group)
      
      const friendConvo = directConversations.filter((convo)=>convo.participants.find((parti)=>parti.userId !== user.userId)?.user.friends.some((frnd)=>frnd.userId === user.userId))

      const starConvoersations = conversations.filter((convo)=>convo.StarConversation.find((convo)=>convo.userId === user.userId))

      res.json({
        directConversations: directConversations,
        groupConversations: groupConversations,
        friendConvo: friendConvo,
        favouriteConvo:starConvoersations,
        totalResults: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
      return;
    }


    // Perform parallel searches
    const  conversations = await prisma.conversation.findMany({
      where: {
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
            group: {
              name: { contains: searchTerm, mode: "insensitive"}
            }
          },
        ],
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
            }
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        group: {
          include: {
            participants: true,
            Conversation: true
          }
        },
        StarConversation:true
      },
      take: limit,
      skip: skip,
    })

    // Get total counts for pagination
    const total = await prisma.conversation.count();

    const directConversations = conversations.filter((convo)=>convo.participants.length === 2)

    const groupConversations = conversations.filter((convo)=>convo.participants.length > 2).map((group)=>group.group)
    
    const friendConvo = directConversations.filter((convo)=>convo.participants.find((parti)=>parti.userId !== user.userId)?.user.friends.some((frnd)=>frnd.userId === user.userId))

    const starConvoersations = conversations.filter((convo)=>convo.StarConversation.find((convo)=>convo.userId === user.userId))

    res.json({
      directConversations: directConversations,
      groupConversations: groupConversations,
      friendConvo: friendConvo,
      favouriteConvo:starConvoersations,
      totalResults: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
    return;

  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({
      error: "An error occurred while searching",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
    return;
  }
};
