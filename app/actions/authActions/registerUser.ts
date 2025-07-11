import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import { createSessionForUser } from './createSession';
import { DisappearingMessages, Gender, LastSeen, Precense } from '@prisma/client';
import dotenv from 'dotenv';
import { prisma } from '../../configs/prisma';
import { read } from 'fs';

dotenv.config()

type RegisterUserRequest = {
    firstname: string;
    lastname: string;
    phoneNumber: string;
    email: string;
    password: string;
    gender: Gender 

};

const domain = process.env.ENV 




const registerUser: RequestHandler = async ( req: Request, res: Response) => {
    
    const {
        firstname,
        lastname,
        phoneNumber,
        email,
        password,
        gender,
    } :RegisterUserRequest = req.body;

    const missingField = !firstname ? 'firstname' :
    !lastname ? 'lastname' :
    !phoneNumber ? 'phoneNumber' :
    !email ? 'email' : null;

    switch (missingField) {
        case 'firstname':
            res.status(400).json({ error: 'firstname is required' });
            return 
        case 'lastname':
            res.status(400).json({ error: 'lastname is required' });
            return
        case 'phoneNumber':
            res.status(400).json({ error: 'phoneNumber is required' });
            return 
        case 'email':
            res.status(400).json({ error: 'email is required' });
            return 
        default:
            break;
    }

    const hashed = await bcrypt.hash(password, 10);

    try{
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ error: 'email already exists' });
            return
        }
        
        const Genda = (genda: string) => {
            switch(genda){
                case "male":
                    return Gender.MALE
                case "female":
                    return Gender.FEMALE
                case "others":
                    return Gender.OTHERS
                default:
                    break;
            }
        }
        const newUser = await prisma.user.create({
            data: {
                email,
                name: `${firstname} ${lastname}`,
                password: hashed,
                profile: {
                    create: {
                        bio: "",
                        firstName: firstname,
                        lastName: lastname,
                        gender: Genda(gender),
                        phoneNumber: phoneNumber,    
                        birthDay: undefined,
                        privacy: {
                            create: {
                                disappearingMessages: DisappearingMessages.OFF,
                                lastSeen: LastSeen.EVERYONE,
                                precense: Precense.EVERYONE,
                                readReciept: true,
                            }
                        }
                    }
                }
            },
            include: {
                profile: {
                    select: {
                        id: true,
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

        if(newUser){
           const sessionId = await createSessionForUser(newUser)
            

           res.cookie('sessionID', sessionId, {
               httpOnly: true,
               secure: true,
               sameSite: 'none',
               maxAge: 24 * 60 * 60 * 1000, 
               expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
           });
   
       
           res.status(200).json({
               message: "User registered successfully",
                user: {
                   name:  newUser.name,
                   email: newUser.email,

                },
               sessionId: sessionId?.sessionId,
           });
        }
        else{
            res.status(400).json({ error: "User not registered",
                sessionId: null});
            return 
        }
        

        

    }
    catch(err){
        res.status(500).json({ error: `Internal server error: ${err}` })
        return
    }
}
 
export default registerUser;