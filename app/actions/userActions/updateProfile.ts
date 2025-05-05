import { RequestHandler, Request, Response } from "express";
import { prisma } from "../../configs/prisma";
import { Gender } from "@prisma/client";
import { Genda, } from "../../utils/typesConversion";


const update_profile: RequestHandler = async(req: Request, res: Response) => {

    const user = req.user;
    if (!user) {
        res.status(401).json({
            error: "Unauthorized"
        })
        return
    }

    const {image, coverPicture, firstName, precense, readReciept,  lastSeen, disappearingMessages, lastName, email, bio, nickname, phoneNumber, gender, birthDay} = req.body;

    try{
        const data =  await prisma.user.update({
            where: {
                id: user?.userId
            },
            data: {
                image,
                
                profile: {
                    update: {
                        profilePicture: image ? image : undefined,
                        bio: bio ? bio : undefined,
                        birthDay: birthDay !== undefined ? birthDay : undefined,
                        coverPicture: coverPicture !== undefined ? coverPicture : undefined,
                        firstName: firstName !== undefined ? firstName : undefined,
                        lastName: lastName !== undefined ? lastName : undefined,
                        gender: gender !== undefined ? Genda(gender) : Gender.OTHERS,
                        phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
                        nickname: email !== undefined ? email : undefined,


                    }
                }
            }
        })
        if (!data) {
            res.status(404).json({
                error: "User not found"
            })
            return
        }
        res.status(200).json(data)
        return
    }
    catch(error){
        console.error("Error updating profile picture:", error);
        res.status(500).json({
            error: "Internal server error"
        }); 
    }
    return ;
}
 
export default update_profile;