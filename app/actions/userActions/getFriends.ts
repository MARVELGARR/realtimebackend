import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
import { Prisma } from "@prisma/client";



const getFriends: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { limit, offset, searchTerm = "" } = req.query;
  const userId = req.user.userId;

  const nameFilter = searchTerm
  ? {
      is: {
        name: {
          contains: searchTerm as string,
          mode: Prisma.QueryMode.insensitive
        },
      },
    }
  : undefined;

  try {
    const friendships = await prisma.friendship.findMany({
      skip: Number(offset) || 0,
      take: Number(limit) || 10,
      where: {
        OR: [
          { user1Id: userId, user1: nameFilter },
          { user2Id: userId, user2: nameFilter }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
             name: true,
             email: true,
             image: true,
             profile: {
                select: {
                    profilePicture: true,
                    bio: true
                }
             }
        }
        },
        user2: {
          select: {
            id: true,
             name: true,
             email: true,
             image: true,
             profile: {
                select: {
                    profilePicture: true,
                    bio: true
                }
             }
        }
        }
      }
    });

    // Normalize to always return the other user (not the logged-in user)
    const friends = friendships.map((friendship) =>
      friendship.user1Id === userId ? friendship.user2 : friendship.user1
    );

    const totalCount = await prisma.friendship.count({
      where: {
        OR: [
          {
            user1Id: userId,
            user2: nameFilter
          },
          {
            user2Id: userId,
            user1: nameFilter
          },
        ],
      },
    });


    res.status(200).json({ friends, totalCount });
    return;
  } catch (error) {
    console.error("Error getting friends:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};



export default getFriends;
