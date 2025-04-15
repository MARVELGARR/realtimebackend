import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";

const readMessage: RequestHandler = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  if (!conversationId || conversationId === "null") {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Update read status for a user in a conversation
    await prisma.unreadMessage.upsert({
      where: {
        // You'll need a unique constraint on conversationId and userId
        // or use a compound ID if your schema supports it
        conversationId_userId: {
          conversationId: conversationId,
          userId: user?.userId,
        },
      },
      update: {
        lastReadAt: new Date(),
        unreadCount: 0, // Reset unread count
      },
      create: {
        conversationId: conversationId,
        userId: user?.userId,
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    });

    
    res.status(200).json({ success: true });
    return
  } catch (error) {
    console.error("Error updating read status:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export default readMessage;
