
import { Response, Request, RequestHandler} from "express"
import bcrypt from 'bcrypt';
import { createSessionForUser } from "./createSession";
import { prisma } from "../../configs/prisma";

type loginUserProp ={
    email: string
    password:string
}

export const loginUser: RequestHandler = async (req: Request, res: Response) => {

    const {email, password}:loginUserProp = req.body

    if(!email){
        res.status(400).json({
            error: "Email is required"
        })
        return
    }
    if (!password) {
         res.status(400).json({ error: 'Password is required' });
         return
    }

    try{
        const user = await  prisma.user.findUnique({
            where: {
                email
            },
            include: {
                profile: {
                    select: {
                        bio: true,
                        birthDay: true,
                        nickname: true,
                        phoneNumber: true,
                        gender: true,
                        profilePicture: true,
                        privacy: {
                            select: {
                                disappearingMessages: true,
                                lastSeen: true,
                                precense: true,
                                readReciept: true,
                                
                            }
                        }
                    }
                }
            }

        })
        if(!user){
            res.status(404).json({
                error: "You don't have an account"
            })
            return
        }
        const isPasswordValid = await bcrypt.compare(password, user?.password as string)
        
        if(!isPasswordValid){
            res.status(401).json({
                error: "Wrong Password"
            })
            return
        }

        const sessionID = await createSessionForUser(user!)

     

        res.cookie('sessionID', sessionID.sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000, 
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({
            message: "Login successful",
            user: user,
            sessionId: sessionID?.sessionId,
        })
        return

    }
    catch(error){
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return
    }

}