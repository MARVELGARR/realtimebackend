import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const acceptFriendRequest: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { requestId, senderId } = req.body;
  if (!senderId) {
    res.status(404).json({ message: "user 2 id is missing" });
    return;
  }

  try {
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: user.userId, user2Id: senderId },
          { user1Id: senderId, user2Id: user.userId },
        ],
      },
    });

    if (existing) {
      throw new Error("Friendship already exists.");
    }

    const data = await prisma.$transaction(async (prisma) => {
      const friendship = await prisma.friendship.create({
        data: {
          user1Id: user.userId,
          user2Id: senderId,
        },
      });
      await prisma.friendRequest.delete({
        where: {
          id: requestId,
        },
      });
      return friendship;
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error accepting friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  return;
};

export default acceptFriendRequest;
