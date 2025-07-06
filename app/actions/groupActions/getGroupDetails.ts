import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const getGroupDetails: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { groupId } = req.params;
  if (!groupId) {
    res.status(400).json({ error: "Group ID is required" });
    return;
  }
  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        participants: {

          select: {

            user: {
              select: {
                id: true,
                name: true,
                image: true,
                friendshipsInitiated: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    gender: true,
                    bio: true,
                    blockedBy: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error getting group details:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export default getGroupDetails;
