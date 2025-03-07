import { Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { prisma } from "../../configs/prisma";

const FormSchema = z.object({
  lastSeen: z.enum(["EVERYONE", "MYCONTACTS", "NOBODY"]).optional(),
  online: z.enum(["EVERYONE", "NOBODY"]).optional(),
  readreceipt: z.boolean().default(false).optional(),
  disappearing: z.enum(["OFF", "DAYS90", "DAYS7", "H24"]).optional(),
});

export type AccountFormType = z.infer<typeof FormSchema>;

const updateUserPrivacy: RequestHandler = async (req: Request, res: Response) => {
  const { currentProfileId } = req.params;
  const { disappearing, lastSeen, online, readreceipt } = req.body as AccountFormType;


  console.log(currentProfileId)

  if (!currentProfileId || currentProfileId === "null") {
     res.status(400).json({ error: "Invalid profile ID" });
     return
  }

  try {
    // Validate input
    const parsedData = FormSchema.parse({ disappearing, lastSeen, online, readreceipt });

    const isPrivacyExist = await prisma.privacy.findUnique({
      where: {profileId: currentProfileId }
    })

    if (!isPrivacyExist) {
      // Create a new privacy record if it does not exist
      const createPrivacy = await prisma.privacy.create({
        data: {
          profileId: currentProfileId,
          disappearingMessages: parsedData.disappearing,
          lastSeen: parsedData.lastSeen,
          precense: parsedData.online, 
          readReciept: parsedData.readreceipt,
        },
      });
      if(createPrivacy){

        res.status(200).json({message: "privacy created", privacy: createPrivacy })
        return
      }
    }
    else{
      const privacyUpdated = await prisma.privacy.update({
        where: {profileId: currentProfileId},
        data: {
          disappearingMessages: parsedData.disappearing,
          lastSeen: parsedData.lastSeen,
          precense: parsedData.online,
          readReciept: parsedData.readreceipt,
        }
      })
      if(privacyUpdated){
        res.status(200).json({message: "privacy updates", privacy: privacyUpdated})
        return
      }
    }
    const updatedProfile = await prisma.user.findUnique({
      where: { id: currentProfileId },
      include: {
        profile: {
          include: {
            privacy: true,
          },
        },
      },
    });

    if (updatedProfile) {
      res.status(200).json({ message: "Privacy updated", privacy: updatedProfile.profile?.privacy });
      return;
    }
  } catch (error) {
    console.error('Error updating privacy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  return;
};

export default updateUserPrivacy;