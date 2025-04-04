import { Gender, Prisma } from "@prisma/client";
import { createSessionForUser } from "./createSession";
import { prisma } from '../../configs/prisma';
import { scopes } from "../../configs/auth";

export interface OauthRespondsUser {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    gender?: Gender
    birthDay?: Date
    phoneNumber?: string
}
export type NewOauthUserType = Prisma.UserGetPayload<{ include: { profile: { select: { phoneNumber: true, profilePicture: true, privacy: { select: { readReciept: true, disappearingMessages: true, precense: true } } } } } }>

export const createOauthUser = async (user: OauthRespondsUser) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: {
            profile: {
                select: {
                    id: true
                }
            }
        }

    });
  
    if (existingUser) {
        return await createSessionForUser(existingUser);
    }

    // If user doesn't exist, create new user with account
    const newUser = await prisma.user.create({
        data: {
            email: user.email,
            name: user.name,
            image: user.picture,
            password: "",
            profile: {
                create: {
                    bio: "",
                    profilePicture: user.picture,
                    firstName: user.given_name,
                    lastName: user.family_name,
                    birthDay: user.birthDay,
                    gender: user.gender,
                    phoneNumber: user.phoneNumber

                }
            },
            accounts: {
                create: [{
                    type: "oauth",
                    provider: 'google',
                    providerAccountId: user.id,
                    access_token: user.access_token || '',
                    refresh_token: user.refresh_token || '',
                    token_type: 'Bearer',
                    scope: scopes.join(" "),
                    id_token: user.id_token || '',
                    expires_at: null,
                }]
            }
        },
    }) 

    

    if(newUser){
        return await createSessionForUser(newUser);
    }

};
