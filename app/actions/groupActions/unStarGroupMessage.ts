import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const unStarGroupMessage: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  const { messageId, currentProfileId } = req.body;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
  }

  if (!messageId) {
    res.status(400).json({ message: "Message ID is required" });
    return;
  }
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const isExist = await prisma.starredMessage.findUnique({
      where: {
        profileId_messageId: {
          profileId: currentProfileId,
          messageId: messageId,
        },
      },
    });

    if (!isExist) {
      res.status(404).json({ message: "Starred message not found" });
      return;
    }
    const result = await prisma.starredMessage.delete({
      where: {
        profileId_messageId: {
          profileId: currentProfileId,
          messageId: messageId,
        },
      },
    });

    if (result) {
      res.status(200).json({ message: "Message unstarred successfully" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
    return;
  }
};

export default unStarGroupMessage;
