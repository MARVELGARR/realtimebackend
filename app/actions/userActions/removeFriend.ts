import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const removeFriend: RequestHandler = async (req: Request, res: Response) => {

    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { receiverId } = req.body; // Assuming you send the receiverId in the request body
    if (!receiverId) {
        res.status(400).json({ message: "Receiver ID is required" });
        return;
    }

    
    try {
        // First, find the friendship by user1Id and user2Id
        const friendship = await prisma.friendship.findFirst({
            where: {
                user1Id: user?.userId,
                user2Id: receiverId
            }
        });

        if (!friendship) {
            res.status(404).json({ message: "Friendship not found" });
            return;
        }

        const removeFriend = await prisma.friendship.delete({
            where: {
                id: friendship.id
            }
        });
        res.status(200).json(removeFriend)
        return 
    } catch (error) {
        console.error("Error unfriending:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
    

};

export default removeFriend;
