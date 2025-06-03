import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";


const getParticipantProfile: RequestHandler = async (req: Request, res: Response) => {
     const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  };

  const {userId} = req.params

  try{
    const participant = await prisma.user.findFirst({
        where: {
            id: userId
        },
        include : {
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    bio: true,
                    gender: true,
                    birthDay: true,
                    coverPicture: true,
                    nickname: true,
                    phoneNumber: true,
                    profilePicture: true,
                    StarredMessage: true
                }
            }
        }
    })

    res.status(200).json(participant)
    return 
  }
  catch(error){
    console.error({})
    res.status(500).json({error: "something went"})
  }
}
 
export default getParticipantProfile;