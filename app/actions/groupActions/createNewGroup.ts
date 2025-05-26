import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const createNewGroup: RequestHandler = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const {
    groupName,
    groupImage,
    groupmembers,
  }: { groupName: string; groupImage: string; groupmembers: string[] } =
    req.body;


    const modefiedGroupMembers  =[...groupmembers, req.user.userId];

  try {
    const group = prisma.$transaction(async (tx)=>{
      const conversation = await tx.conversation.create({
        data: {
          conversationType: "GROUP",
          
          participants: {
            createMany: {
              data: modefiedGroupMembers.map((id)=>({userId: id}))
            }
          }
        }
      })
      const newGroup = await  tx.group.create({
        data: {
          name: groupName,
          groupImage: groupImage,
          creatorId: req.user!.userId,
          adminId: req.user!.userId,
          
          participants: {
            connect: groupmembers.map((id) => ({
              userId_conversationId: {
                userId: id,
                conversationId: conversation.id,
              },
            })),
          },
        },
      });

      return tx.conversation.update({
        where: { id: conversation.id },
        data: {
          groupId: newGroup.id,
        }
      })
    })
    

    
    res.status(201).json(group);
    return;
  } catch (error) {
    res.status(500).json({ message: "Failed to create group", error });
  }

  return;
};

export default createNewGroup;
