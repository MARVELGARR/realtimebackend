
import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const sendFriendRequest: RequestHandler = async (req: Request, res: Response) => {
         const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  };
    const { receiverId } = req.params;
    if (!receiverId) {
        res.status(404).json({ message: "Receiver ID is missing" });
        return;
    }
    try{
        const friendRequest = await prisma.friendRequest.create({
            data: {
                senderId: user.userId,
                receiverId: receiverId,

            }
        })
        if (!friendRequest) {
            res.status(404).json({ message: "Friend request not sent" });
            return;
        }
        res.status(200).json({ message: "Friend request sent successfully", friendRequest });
        return;
    }
    catch(error){
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}
 
export default sendFriendRequest;