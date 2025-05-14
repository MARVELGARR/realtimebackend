import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const getFriendsRequest: RequestHandler = async (req: Request, res: Response) => {

    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try{
        const data = await prisma.friendRequest.findMany({
            where: {
                receiverId: user.userId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true
                    }
                }
            }
            
        })

        res.status(200).json(data)
        return
    }
    catch(error){
        console.error("Error getting friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
     
}
 
export default getFriendsRequest;