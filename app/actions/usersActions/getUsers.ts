import {Request, Response, RequestHandler } from 'express';
import { prisma } from '../../configs/prisma';


const getUsers: RequestHandler = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    // Fetch the current user's profile
    const profile = await prisma.profile.findUnique({
        where: { userId: user.userId }
    });
    if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
    }
    
    const { limit, offset, searchTerm = '' } = req.query;
    
    try {
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                skip: Number(offset) || 0,
                take: Number(limit) || 10,
                where: {
                    name: {
                        contains: searchTerm as string,
                        mode: 'insensitive'
                    },
                    profile: {
                        blockedBy: {
                            none: {
                                id: profile.id // Use the profile id here
                            }
                        }
                    }
                },
                include: {
                    profile: {
                        select: {
                            profilePicture: true,
                            nickname: true,
                            bio: true,
                            gender: true,
                            phoneNumber: true,
                            createdAt: true,
                            birthDay: true,

                            coverPicture: true,
                        }
                    }
                }
            }),
            prisma.user.count({
                where: {
                    name: {
                        contains: searchTerm as string,
                        mode: 'insensitive'
                    },
                    profile: {
                        blockedBy: {
                            none: {
                                id: profile.id
                            }
                        }
                    }
                }
            })
        ]);
        res.status(200).json({ users, totalCount });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}
 
export default getUsers;