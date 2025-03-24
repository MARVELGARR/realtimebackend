import { RequestHandler, Response, Request } from "express";
import { prisma } from "../../configs/prisma";
import { $Enums, GroupRole, Prisma } from "@prisma/client";


type disappearingMessages = "OFF" | "DAYS90" |'DAYS7' |"H24"


export type newGroupDetailsProp = {
  name: string
  participant: string[],
  groupImage: string, 
  disappearingMessages: disappearingMessages
  groupDescription: string
    
}

const createGroup: RequestHandler = async( req: Request, res: Response) => {

    const user = req.user
    if(!user){
        res.status(401).json({error: "user not logged in"})
        return
    }

    const {newGroupDetails}: {newGroupDetails:newGroupDetailsProp} = req.body 

    const adminId = user.userId
    const others = newGroupDetails.participant.filter((Ids) => Ids !== adminId)

    if(!newGroupDetails){
        res.status(400).json({error: "no group details found"})
        return
    }

    try {
        // Validate the group details
        if (!newGroupDetails.participant || newGroupDetails.participant.length === 0) {
             res.status(400).json({ error: "Participants are required to create a group" });
             return
        }


        if(!newGroupDetails.name){
            res.status(400).json({ error: "Group name is required" });
            return
        }

        type GroupWithConversation = Prisma.GroupGetPayload<{
          name: string;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          groupImage: string | null;
          disappearingMessages: $Enums.DisappearingMessages;
          descriptions: string | null;
          creatorId: string;
          adminId: string;
          include: { 
            Conversation: { 
              select: { 
                id: true;
                participants: true;
              } 
            } 
          }
        }>;

        const result = await prisma.$transaction(async (tx) => {
          const newGroup = await tx.group.create({
            data: {
              name: newGroupDetails.name,
              admin: {
                connect: { id: user.userId }
              },
              creator: {
                connect: { id: user.userId }
              },
              Conversation: {
                create: {
                  participants: {
                    create: [ { userId: user.userId, groupRole: GroupRole.ADMIN },
                      ...others.map((id) => ({ 
                        userId: id,
                        groupRole: GroupRole.PARTICIPANT
                      }))]
                  }
                }
              },
              descriptions: newGroupDetails.groupDescription,
              disappearingMessages: newGroupDetails.disappearingMessages || "OFF",
              groupImage: newGroupDetails.groupImage
            },
            include:{
              Conversation: {
                select:{
                  id: true,
                  participants: true
                }
              }
            }
          }) as GroupWithConversation;
        
          const addParticipant = await tx.group.update({
            where: {
              id: newGroup.id
            },
            data: {
              participants: {
                connect: newGroup.Conversation.flatMap((par) => 
                  par.participants.map((participant) => ({ id: participant.id }))
                )
              },
            }
          });
          

          return { newGroup, addParticipant,  };
        });
        
        

        
        res.status(201).json({ message: "Group created successfully", group: result.newGroup });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}
 
export default createGroup;