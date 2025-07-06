import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const addParticipant: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { groupId } = req.params;
  if(!groupId) {
    res.status(400).json({ message: "Group ID is required" });  
  }

  const { participantIds } = req.body;
  if(!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    res.status(400).json({ message: "Participant IDs are required and should be an array" });
  }
  try {
    console.log(participantIds);

    const addParticipant = await prisma.$transaction(async (tx) => {
      const getConversation = await tx.conversation.findFirst({
        where: {
          groupId,
        },
      });
      const group = await tx.group.update({
        where: {
          id: groupId,
        },
        data: {
          participants: {
            connectOrCreate: (participantIds as string[]).map((id) => ({
              where: {
                userId_conversationId: {
                  userId: id,
                  conversationId: getConversation?.id!,
                },
              },
              create: {
                userId: id,
                conversationId: getConversation?.id!,
              },
            })),
          },
        },
      });

      // Update each participant individually since update expects a unique identifier
      for (const id of participantIds as string[]) {
        await tx.conversationParticipant.update({
          where: {
            userId_conversationId: {
              userId: id,
              conversationId: getConversation?.id!,
            },
          },
          data: {
            groupId: group.id,
          },
        });
      }
    });

    res.status(200).json(addParticipant);
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export default addParticipant;
