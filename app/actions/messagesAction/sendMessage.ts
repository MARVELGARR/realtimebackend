import { prisma } from "../../configs/prisma";

type SendMessageParams = {
  conversationId?: string;
  conversationType: "DIRECT" | "GROUP";
  message: string;
  receiverId: string;
  currentUserId: string;
};

const sendMessage = async ({
  conversationId,
  conversationType,
  message,
  receiverId,
  currentUserId,
}: SendMessageParams) => {
  try {
if (!conversationId) {
  // Conversation creation logic...
} else {
  const newMessage = await prisma.message.create({
    data: {
      content: message,
      userId: currentUserId,
      conversationId,
    },
  });

  if (!newMessage) throw new Error("Message not sent");

  if (conversationType === "GROUP") {
  // Fetch all participants in the group except the sender
  const groupParticipants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
      NOT: { userId: currentUserId },
    },
    select: { userId: true },
  });

  await Promise.all(
    groupParticipants.map(({ userId }) =>
      prisma.unreadMessage.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        update: {
          unreadCount: {
            increment: 1,
          },
        },
        create: {
          conversationId,
          userId,
          unreadCount: 1,
        },
      })
    )
  );
} else {
  // DIRECT message unread update
  await prisma.unreadMessage.upsert({
    where: {
      conversationId_userId: {
        conversationId,
        userId: receiverId!,
      },
    },
    update: {
      unreadCount: {
        increment: 1,
      },
    },
    create: {
      conversationId,
      userId: receiverId!,
      unreadCount: 1,
    },
  });
}


  return newMessage;
}

  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

export default sendMessage;
