import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const removeParticipant: RequestHandler = async (req: Request, res: Response) => {
    const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

   const { groupId } = req.params;
     if(!groupId) {
    res.status(400).json({ message: "Group ID is required" });  
  }

  const { participantId } = req.query;
  if(!participantId) {
    res.status(400).json({ message: "Participant ID is required" });
  }

  try{
    const removeParticipant = await prisma.$transaction(async (tx) => {
      const getConversation = await tx.conversation.findFirst({
        where: {
          groupId, 
        },
      });

      if (!getConversation) {
        res.status(404).json({ message: "Conversation not found" });
        return;
      }

      // Remove the participant from the group
      const group = await tx.group.update({
        where: {
          id: groupId,
        },
        data: {
          participants: {
            disconnect: { userId_conversationId: { userId: participantId as string, conversationId: getConversation.id as string } },
          },
        },
      });

      // Remove the participant from the conversation
      await tx.conversationParticipant.delete({
        where: {
          userId_conversationId: { userId: participantId! as string, conversationId: getConversation.id },
        },
      });

      return group;
    });

    res.status(200).json({ message: "Participant removed successfully", data: removeParticipant });
    return;
  }
  catch(error){
    console.error("Error removing participant:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
 
export default removeParticipant;