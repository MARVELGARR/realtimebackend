import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";


const getBlockedUsers: RequestHandler = async (req: Request, res: Response) => {

    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try{

        const getBlockedUser = await prisma.$transaction( async (tx)=>{

            const blockedUser = await tx.block.findMany({
                where: {
                    blockerId: user.userId
                },
            })
    
            return tx.user.findMany({
                where: {
                    id: {
                        in: [...blockedUser.map((id)=>id.blockedId)]
                    }
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    profile: {
                        select: {
                            bio: true,
                            gender: true,
                            profilePicture: true
                        }
                    }
                }
            })
        })
        res.status(200).json(getBlockedUser)
    }
    catch(error){
        console.error("Error getting blocked user:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
    return
}
 
export default getBlockedUsers;