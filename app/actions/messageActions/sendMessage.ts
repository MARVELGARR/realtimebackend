import { Request, Response } from "express";
import { prisma } from "../../configs/prisma";
import { z } from "zod";

const formSchema = z.object({
  message: z.string(),
  reciepientId: z.string().optional(),
});

export type MessageFormData = z.infer<typeof formSchema>;

const sendMessage = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messageBody = req.body;

  const { reciepientId, message } = messageBody as MessageFormData;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = req.user;

  try {
    const parsedData = formSchema.parse({ message, reciepientId });

    let newMessage;
    const editExpire = new Date(new Date().getTime() + 20 * 60000);
    if (conversationId && conversationId !== "undefined") {
      // If conversationId is provided, connect to the existing conversation
      newMessage = await prisma.message.create({
        data: {
          content: parsedData.message as string,
          user: {
            connect: {
              id: user.userId
            }
          },
          editableUntil: editExpire,
          conversation: {
            connect: {
              id: conversationId
            }
          }
        },
        include: {
          conversation: true
        }
      });
    } else {
      // If conversationId is not provided, create a new conversation
      newMessage = await prisma.message.create({
        data: {
          content: parsedData.message as string,
          user: {
            connect: {
              id: user.userId
            }
          },
          editableUntil: editExpire,
          conversation: {
            create: {
              type: "DIRECT",
              participants: {
                create: [
                  { userId: user.userId },
                  { userId: parsedData.reciepientId as string }
                ]
              }
            }
          }
        },
        include: {
          conversation: true
        }
      });
    }

    if (newMessage) {
      res.status(200).json({ message: "Message sent", newMessage });
      return;
    } else {
      res.status(400).json({ error: "Message not sent" });
    }
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export default sendMessage;