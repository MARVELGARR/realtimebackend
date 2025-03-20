import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const starGroupMessage: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  const { messageId, currentProfileId } = req.body;

  if (!messageId) {
    res.status(400).json({ message: "Message ID is required" });
    return;
  }
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const isLiked = await prisma.starredMessage.findFirst({
      where: {
        messageId,
        profileId: currentProfileId,
      },
    });
    if (isLiked) {
      res.status(200).json({ message: "Message already starred" });
      return;
    }

    const result = await prisma.starredMessage.create({
      data: {
        messageId,
        profileId: currentProfileId,
      },
    });
    if (result) {
      res.status(201).json({ message: "messages liked" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
    return;
  }
};

export default starGroupMessage;
