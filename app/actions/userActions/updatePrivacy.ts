import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";
import { DSM, LS, PRS } from "../../utils/typesConversion";

const updatePrivacy: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const { disappearingMessages, lastSeen, readReciept, precense } = req.body;
  console.log("incoming:", {
    disappearingMessages,
    lastSeen,
    readReciept,
    precense,
  });
  const userProfile = await prisma.profile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  const data = await prisma.privacy.update({
    where: { profileId: userProfile?.id },
    data: {
      disappearingMessages:
        disappearingMessages !== undefined
          ? DSM(disappearingMessages)
          : undefined,
      lastSeen: lastSeen !== undefined ? LS(lastSeen) : undefined,
      readReciept:
        typeof readReciept === "boolean" ? readReciept : undefined,
      precense: precense !== undefined ? PRS(precense) : undefined,
    },
  });
  
  res.status(200).json(data);
  return;
};

export default updatePrivacy;
