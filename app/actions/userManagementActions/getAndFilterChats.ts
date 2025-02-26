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
  const searchTerm = req.query.searchTerm as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    // If no search term, return recent conversations
    if (!searchTerm) {
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
          
        },
        take: limit,
        skip: skip,
      });

      const total = await prisma.conversation.count();

      res.json({
        conversations,
        totalResults: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
      return;
    }

    // Perform parallel searches
    const [users, conversations, groups] = await Promise.all([
      // Search users with their profiles
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            {
              profile: {
                OR: [
                  { firstName: { contains: searchTerm, mode: "insensitive" } },
                  { lastName: { contains: searchTerm, mode: "insensitive" } },
                  {
                    phoneNumber: { contains: searchTerm, mode: "insensitive" },
                  },
                  { nickname: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              profilePicture: true,
              gender: true,
              bio: true,
              nickname: true,
              userId: true,
              blockedBy: true,
            },
          },
        },
        take: limit,
        skip: skip,
      }),

      // Search conversations
      prisma.conversation.findMany({
        where: {
          OR: [
            {
              messages: {
                some: {
                  content: { contains: searchTerm, mode: "insensitive" },
                },
              },
            },
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
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                      profilePicture: true,
                      gender: true,
                      bio: true,
                      nickname: true,
                      userId: true,
                      blockedBy: true,
                    },
                  },
                },
              },
            },
          },
          messages: {
            where: {
              content: { contains: searchTerm, mode: "insensitive" },
            },
            take: 3,
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
        },
        take: limit,
        skip: skip,
      }),

      // Search groups
      prisma.group.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          admin: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      profilePicture: true,
                    },
                  },
                },
              },
            },
          },
        },
        take: limit,
        skip: skip,
      }),
    ]);

    // Get total counts for pagination
    const [totalUsers, totalConversations, totalGroups] = await Promise.all([
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            {
              profile: {
                OR: [
                  { firstName: { contains: searchTerm, mode: "insensitive" } },
                  { lastName: { contains: searchTerm, mode: "insensitive" } },
                  {
                    phoneNumber: { contains: searchTerm, mode: "insensitive" },
                  },
                ],
              },
            },
          ],
        },
      }),
      prisma.conversation.count({
        where: {
          OR: [
            {
              messages: {
                some: {
                  content: { contains: searchTerm, mode: "insensitive" },
                },
              },
            },
            {
              participants: {
                some: {
                  user: {
                    name: { contains: searchTerm, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        },
      }),
      prisma.group.count({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
      }),
    ]);

    const response: SearchResponse = {
      users,
      conversations,
      groups,
      totalResults: totalUsers + totalConversations + totalGroups,
    };
    console.log({
      ...response,
      currentPage: page,
      totalPages: Math.ceil(response.totalResults / limit),
    });

    res.json({
      ...response,
      currentPage: page,
      totalPages: Math.ceil(response.totalResults / limit),
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
