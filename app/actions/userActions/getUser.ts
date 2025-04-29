import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const getUser: RequestHandler = async(req: Request, res: Response) => {

    const user= req.user;
    if(!user){
        res.status(401).json({
            error: "Unauthorized"
        })
        return
    }
    try{
        const userData = await prisma.user.findUnique({
            where: {
                id: user?.userId
            },
            include: {
                profile: true
            }

        })

        if(!userData){
            res.status(404).json({
                error: "User not found"
            })
            return
        }

        res.status(200).json(userData)
    }
    catch(error){
        console.error("Error fetching user data:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }

}
 
export default getUser;



// name: string | null;
// id: string;
// email: string | null;
// emailVerified: boolean | null;
// image: string | null;
// password: string | null;
// createdAt: Date;
// updatedAt: Date;

// profile: {
//     id: string;
//     createdAt: Date;
//     updatedAt: Date;
//     userId: string;
//     bio: string | null;
//     firstName: string | null;
//     lastName: string | null;
//     nickname: string | null;
//     phoneNumber: string | null;
//     gender: $Enums.Gender;
//     birthDay: Date | null;
//     profilePicture: string | null;
// } | null;