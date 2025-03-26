import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";

const sendGroupMessage: RequestHandler = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(200).json({ message: "user not logged in" });
    return;
  }
  const message = req.body.message;

  const { conversationId } = req.params;
  if (!conversationId) {
    res.status(404).json({ error: "conversationId is required" });
    return;
  }
  try {
    const groupmessage = await prisma.message.create({
      data: {
        conversation: {
            connect: {
                id: conversationId
            }
        },
        content: message,
        user: {
            connect: {
                id: req.user.userId
            }
        },
        editableUntil: new Date(Date.now() + 1000 * 60 * 20),
        type: "GROUP",

        
      },
    });

    res.status(200).json(message);
    return;
  } catch (error) {
    res.status(500).json({ error: "something went wrong" });
    return;
  }
};

export default sendGroupMessage;
