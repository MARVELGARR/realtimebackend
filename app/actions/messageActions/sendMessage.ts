import { Request, Response } from "express";
import { prisma } from "../../configs/prisma";
import { z } from "zod";

const formSchema = z.object({
  message: z.string(),
});

export type MessageFormData = z.infer<typeof formSchema>;

const sendMessage = async (req: Request, res: Response) => {
  // Get recipientId from either URL params or request body
  const { reciepientId } = req.params;
  const messageBody = req.body;
  
  const { message } = messageBody as MessageFormData;
  

  
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = req.user;
  
  try {
    const parsedData = formSchema.parse({ message });
    
    let newMessage;
    const editExpire = new Date(new Date().getTime() + 20 * 60000);
    
    if (reciepientId && reciepientId !== "undefined") {
      // First, check if a conversation exists between these users
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId: user.userId
                }
              }
            },
            {
              participants: {
                some: {
                  userId: reciepientId
                }
              }
            }
          ]
        }
      });
      
      if (existingConversation) {
        // If conversation exists, connect to it
        newMessage = await prisma.message.create({
          data: {
            content: parsedData.message,
            user: {
              connect: {
                id: user.userId
              }
            },
            type: "DIRECT",
            editableUntil: editExpire,
            conversation: {
              connect: {
                id: existingConversation.id
              }
            }
          },
          include: {
            conversation: {
              select: {
                id: true
              }
            },
            StarredMessage: {
              select: {
                id: true,
                profileId: true,
                messageId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            user: true
          }
        });
      } else {
        // If no conversation exists, create a new one
        newMessage = await prisma.message.create({
          data: {
            content: parsedData.message,
            user: {
              connect: {
                id: user.userId
              }
            },
            type: "DIRECT",
            editableUntil: editExpire,
            conversation: {
              create: {
                participants: {
                  create: [
                    { userId: user.userId },
                    { userId: reciepientId }
                  ]
                }
              }
            }
          },
          include: {
            
            conversation: {
              select: {
                id: true
              }
            },
            StarredMessage: {
              select: {
                id: true,
                profileId: true,
                messageId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            user: true
          }
        });
      }
    } else {
      // Handle group message or other cases without recipient
      // For now, return an error as direct messages need a recipient
      res.status(400).json({ error: "Recipient ID is required for direct messages" });
      return;
    }
    
    const NewMessage = {
      reciepientId: reciepientId,
      newMessage: newMessage
    };
    
    if (NewMessage) {
      res.status(200).json(NewMessage);
      return;
    } else {
      res.status(400).json({ error: "Message not sent" });
    }
  } catch (error) {
    res.status(500).json({ error: `${error}` });
    console.error(error);
  }
};

export default sendMessage;