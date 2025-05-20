
import { prisma } from "../../configs/prisma";

const sendMessage = async (
    {
        conversationId,
      conversationType,
      message,
      receiverId,
      currentUserId
    }: {
         conversationId?: string;
      conversationType: "DIRECT" | "GROUP";
      message: string;
      receiverId: string;
      currentUserId: string;
    }
) => {

  try {
    if (!conversationId) {
      const data = await prisma.$transaction(async (tx) => {
        const conversation = await prisma.conversation.create({
          data: {
            conversationType,
            participants: {
              createMany: {
                data: [{ userId: currentUserId }, { userId: receiverId }],
              },
            },
          },
        });

        const newMessage = await tx.message.create({
          data: { 
            content: message,
            userId: currentUserId,
            conversationId: conversation.id,
          },
        });

        return { conversation, newMessage };
      })
    } else {
        const newMessage = await prisma.message.create({
            data: {
                content: message,
                userId: currentUserId,
                conversationId
            }
        })
        if(!newMessage){
            throw new Error("Message not sent")
        }
        return newMessage
    }
  } catch (error) {
    console.error("Error sending message:", error);

  }
};

export default sendMessage;
