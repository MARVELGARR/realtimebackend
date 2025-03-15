import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";

const getRecepientProfile: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  const { recepientId } = req.params;
  if (!user) {
    res.status(401).json({ message: "user not logged in" });
    return;
  }

  if (!recepientId) {
    res.status(404).json({ message: "recepientId not found" });
    return;
  }
  try {
    const recepientProfile = await prisma.user.findUnique({
      where: { id: recepientId },
       omit: {
        password: true,
        emailVerified: true,

       },
      include: {
        profile: {
          select: {
            bio: true,
            birthDay: true,
            firstName: true,
            lastName: true,
            gender: true,
            nickname: true,
            phoneNumber: true,
            profilePicture: true,
          },
        },
      },
    });
    if (recepientProfile) {
        console.log(recepientProfile)
      res.status(200).json(recepientProfile);
    }
    else{
        res.status(404).json({error: "Profile not found"})
    }
  } catch (error) {
    res.status(500).json({error: "something went wrong"})
  }
};

export default getRecepientProfile;
