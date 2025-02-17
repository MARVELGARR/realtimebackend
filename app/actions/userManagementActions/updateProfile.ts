import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

export const updateProfile: RequestHandler = async (
  req: Request,
  res: Response
) => {
    const userId = req.user?.userId
    const { nickname, bio, email, profilePicture, phoneNumber } = req.body;

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        profile: {
          update: {
            profilePicture,
            nickname,
            bio,
            phoneNumber
          },
        },
      },
      include: {
        profile: true
      }
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
    return;
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
