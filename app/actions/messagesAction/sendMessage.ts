import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const sndMessage: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { conversationType, message, receiverId, conversationId } = req.body;
  try {
    if (!conversationId) {
      const data = await prisma.$transaction(async (tx) => {
        const conversation = await prisma.conversation.create({
          data: {
            conversationType,
            participants: {
              createMany: {
                data: [{ userId: user.userId }, { userId: receiverId }],
              },
            },
          },
        });

        const newMessage = await tx.message.create({
          data: {
            content: message,
            userId: user.userId,
            conversationId: conversation.id,
          },
        });

        return { conversation, newMessage };
      });
      res.status(201).json(data);
    } else {
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export default sndMessage;
