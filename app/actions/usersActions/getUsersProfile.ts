import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const getUsersProfile: RequestHandler = async (req: Request, res: Response) => {
      const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }



  const userId = req.params.userId;
  if(!userId) {
     res.status(400).json({ message: "User ID is required" });
     return
  }
  try{
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
                    profile: {
                        select: {
                            profilePicture: true,
                            nickname: true,
                            bio: true,
                            gender: true,
                            phoneNumber: true,
                            createdAt: true,
                            birthDay: true,
                            
                            coverPicture: true,
                        }
                    },
                    friendshipsInitiated: {
                      select: {
                        user1Id: true,
                        user2Id: true
                      }
                    },
                    friendshipsReceived: {
                      select: {
                        user1Id: true,
                        user2Id: true
                      }
                    }
                }
    });

    if (!userProfile) {
       res.status(404).json({ message: "User not found" });
       return
    }

    res.status(200).json(userProfile);
  }
  catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}
 
export default getUsersProfile;