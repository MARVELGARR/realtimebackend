import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";


const getMessages: RequestHandler = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const {conversationId} = req.params
  const {limit, offset} = req.query

  
    if(!conversationId){
        res.status(401).json({error: "conversatioId is required"})
    }



  try {
    const [messages, totalCount] = await Promise.all([
        
        prisma.message.findMany({
            skip: Number(offset) || 0,
          take: Number(limit) || 10,
            where: {
                conversationId
            },
            orderBy: {
                createdAt: "desc"}
    
        }),
        prisma.message.count({
             where: {
                conversationId
            },
        })
    ]) 
    res.status(200).json({
    messages,
    totalCount,
  });
  } catch (error) {
     console.error("Error getting messages:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
  }

  return;
};

export default getMessages;
