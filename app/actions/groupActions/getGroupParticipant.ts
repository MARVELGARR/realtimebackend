import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";


const getGroupParticipant:RequestHandler = async(req:Request, res:Response) =>{

    if(!req.user){
        res.status(401).json({error: "user not logged in"})
        return
    }
    const conversationId = req.params.conversationId as string
    const searchQuery = req.query.searchQuery as string
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 5


    const skip = (page - 1) * limit
    

    try{

      if(!conversationId){
          res.status(400).json({error: "grouconversationId id is required"})
          return
      }
      const groupParticipant = await prisma.conversationParticipant.findMany({
        where: {
            conversationId: conversationId,
            ...(searchQuery && {
                user: {
                    name: {
                        contains: searchQuery,
                        mode: "insensitive"
                    }
                }
            })
        },
        include: {
          user: {
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                profile:{
                    select:{
                        bio: true,
                        profilePicture: true,
                    }
                }
                
            }
          }      
        },
        skip,
        take: limit,
        orderBy: {
            user:{
                name: "asc"
            }
        }

      })

      const totalParticipants = await prisma.conversationParticipant.count({
        where: {
            conversationId: conversationId,
            ...(searchQuery && {
                user: {
                    name: {
                        contains: searchQuery,
                        mode: "insensitive"
                    }
                }
            })
        },
        skip,
        take: limit,
        orderBy: {
            user:{
                name: "asc"
            }
        }
      })
      const totalPages = Math.ceil(totalParticipants / limit)
        const hasNextPage = page < totalPages
      
      res.status(200).json({
            participants: groupParticipant,
            pagination: {
                currentPage: page,
                totalPages,
                hasNextPage,
                totalParticipants,
                limit
            }
      })
      return

    }
    catch(error){
        console.log(error)
        res.status(500).json({error: "internal server error"})
        return
    }

}
 
export default getGroupParticipant;