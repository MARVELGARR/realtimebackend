import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";




const updateGroupSetting: RequestHandler = async (req: Request, res: Response)=> {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { groupId } = req.params;



    const {  name, groupImage, groupDescription, disappearingMessages,  } = req.body;

    try{

        const updateGroup = await prisma.group.update({
            where: {
                id: groupId,
            },
            data: {
                name: name,
                groupImage: groupImage,
                descriptions: groupDescription,
                disappearingMessages: disappearingMessages,
                
            },
        })
        res.status(200).json(updateGroup);
        return;
    }
    catch(error){
        console.error("Error updating group settings:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}
 
export default updateGroupSetting;