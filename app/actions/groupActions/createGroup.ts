import { RequestHandler, Response, Request } from "express";
import { prisma } from "../../configs/prisma";


type disappearingMessages = "OFF" | "DAYS90" |'DAYS7' |"H24"


export type newGroupDetailsProp = {
    name: string
    participant: string[],
    groupImage: string[] 
    disappearingMessages: disappearingMessages
    
}

const createGroup: RequestHandler = async( req: Request, res: Response) => {

    const user = req.user
    if(!user){
        res.status(401).json({error: "user not logged in"})
        return
    }

    const {newGroupDetails}: {newGroupDetails:newGroupDetailsProp} = req.body 

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

        if (!newGroupDetails.groupImage || newGroupDetails.groupImage.length === 0) {
             res.status(400).json({ error: "Group image is required" });
             return
        }

        if(!newGroupDetails.name){
            res.status(400).json({ error: "Group name is required" });
            return
        }

        const newGroup = await prisma.group.create({
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
                    create: [...newGroupDetails.participant.map((id) => ({ userId: id }))]
                  }
                }
              },
            disappearingMessages: newGroupDetails.disappearingMessages,
            groupImage: newGroupDetails.groupImage[0]
            
            }
        });

        // Respond with the created group details
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}
 
export default createGroup;