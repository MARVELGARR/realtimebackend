import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";


const getMyFriends: RequestHandler = async (req: Request, res: Response) => {
        const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try{
        const data = await prisma.friendship.findMany({
            where: {
                user1Id: user.userId,
                
            },
            select: {
                 user2: {
                    select: {
                        id: true,
                         name: true,
                         email: true,
                         image: true,
                         profile: {
                            select: {
                                profilePicture: true,
                                bio: true
                            }
                         }
                    }
                 }
            }
        })
        res.status(200).json(data)
        return
    }
    catch(error){
         console.error("Error getting friends:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}
 
export default getMyFriends;