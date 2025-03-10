import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";
const getSearchUsers: RequestHandler = async (req: Request, res: Response) => {

    const { search, page, limit} = req.query

    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 5;
    const skip = (pageNumber - 1) * limitNumber;

    try{
        if(!search || search===""){
            return
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {name : {
                        contains: search as string, mode: "insensitive"
                    }
                }, 
                {
                    profile: {
                        OR: [
                          { firstName: { contains: search as string, mode: "insensitive" } },
                          { lastName: { contains: search as string, mode: "insensitive" } },
                          {
                            phoneNumber: { contains: search as string, mode: "insensitive" },
                          },
                          { nickname: { contains: search as string, mode: "insensitive" } },
                        ],
                }
            }
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                profile: {
                  select: {
                    phoneNumber: true,
                    profilePicture: true,
                    gender: true,
                    bio: true,
                    blockedBy: true,
                  },
                },
      
            },
            take: limitNumber,
            skip: skip,
            orderBy: {
                createdAt: "desc"
            }
        })
        if(users){
            res.status(200).json(users)
            return 
        }
    }
    catch(error){
        res.status(500).json({error: "something went wrong"})
        return
    }

}
 
export default getSearchUsers;