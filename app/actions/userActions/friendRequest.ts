import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const SendFriendRequest: RequestHandler = async (req: Request, res: Response) => {
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

    try{
        const data = await prisma.friendRequest.create({
            data: {
               senderId: user.userId,
               receiverId: receiverId,


            }
        })
        if(!data){
            res.status(404).json({ message: "Friend request not found" });
            return;
        }
        res.status(200).json({ message: "Friend request sent successfully" });
        return;

    }
    catch(error){
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
    

    // Logic to send a friend request goes here
    // For example, you might want to create a new record in a "friend_requests" table

    res.status(200).json({ message: "Friend request sent successfully" });
}
 
export default SendFriendRequest;