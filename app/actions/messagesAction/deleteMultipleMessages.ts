import { prisma } from "../../configs/prisma";

const DeleteMultipleMessage = async (messageIds: string[]) => {
     if (!Array.isArray(messageIds)) {
      throw new Error("messageIds must be an array");
    }
  try {
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        id: {
          in: messageIds,
        },
      },
    });

    if (deletedMessages.count === 0) {
      throw new Error("No messages were deleted.");
    }

    return deletedMessages;
  } catch (error) {
    console.error("❌ Error deleting multiple messages:", error);
    throw error; // Re-throw for upstream handlers (like WebSocket logic)
  }
};

export default DeleteMultipleMessage;
