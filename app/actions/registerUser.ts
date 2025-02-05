import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../configs/prisma';
import { createSessionForUser } from './createSession';
import { Gender } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config()

type RegisterUserRequest = {
    firstname: string;
    lastname: string;
    phoneNumber: string;
    email: string;
    password: string;
    gender: Gender 
    birthday: string; 
};

const isDevelopement = process.env.NODE_ENV === 'developement';

export const domain = isDevelopement ? 'localhost' : "https://realtimebackend.onrender.com" ;


const registerUser: RequestHandler = async ( req: Request, res: Response) => {
    
    const {
        firstname,
        lastname,
        phoneNumber,
        email,
        password,
        gender,
        birthday
    } :RegisterUserRequest = req.body;

    const missingField = !firstname ? 'firstname' :
    !lastname ? 'lastname' :
    !phoneNumber ? 'phoneNumber' :
    !email ? 'email' : null;

    switch (missingField) {
        case 'firstname':
            res.status(400).json({ message: 'firstname is required' });
            return 
        case 'lastname':
            res.status(400).json({ message: 'lastname is required' });
            return
        case 'phoneNumber':
            res.status(400).json({ message: 'phoneNumber is required' });
            return 
        case 'email':
            res.status(400).json({ message: 'email is required' });
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
            res.status(400).json({ message: 'email already exists' });
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
                        birthDay: new Date(birthday),
                        gender: Genda(gender),
                        phoneNumber: phoneNumber,    
    
                    }
                }
            }
        })
        if(newUser){
           const sessionId = await createSessionForUser(newUser)


            res.cookie('sessionID', sessionId?.sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: domain,
                maxAge: 24 * 60 * 60 * 1000, 
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
    
        
            res.status(200).json({
                message: "User registered successfully",
                sessionId: sessionId?.sessionId,
            });
        

        }
        else{
            res.status(400).json({ message: "User registered successfully",
                sessionId: null});
            return 
        }

    }
    catch(err){
        res.status(500).json({ message: `Internal server error: ${err}` })
        return
    }
}
 
export default registerUser;