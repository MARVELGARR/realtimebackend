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
        // If conversation exists, connect to it and create message
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
        
        // Update unread state for the recipient
        await prisma.unreadMessage.upsert({
          where: {
            // Assuming you have a unique constraint on conversationId and userId
            // If not, you'll need to adjust this query
            conversationId_userId: {
              conversationId: existingConversation.id,
              userId: reciepientId
            }
          },
          update: {
            unreadCount: {
              increment: 1
            }
          },
          create: {
            conversationId: existingConversation.id,
            userId: reciepientId,
            unreadCount: 1
          }
        });
      } else {
        // If no conversation exists, create a new one with message
        newMessage = await prisma.$transaction(async (tx) => {
          // Create conversation with participants
          const conversation = await tx.conversation.create({
            data: {
              participants: {
                create: [
                  { userId: user.userId },
                  { userId: reciepientId }
                ]
              }
            }
          });
          
          // Create message in the new conversation
          const message = await tx.message.create({
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
                  id: conversation.id
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
          
          // Initialize unread state for recipient
          await tx.unreadMessage.create({
            data: {
              conversationId: conversation.id,
              userId: reciepientId,
              unreadCount: 1
            }
          });
          
          // Initialize read state for sender (0 unread)
          await tx.unreadMessage.create({
            data: {
              conversationId: conversation.id,
              userId: user.userId,
              unreadCount: 0
            }
          });
          
          return message;
        });
      }
    } else {
      // Handle group message or other cases without recipient
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
    if (error instanceof Error) {
      console.error("Error sending message:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export default sendMessage;