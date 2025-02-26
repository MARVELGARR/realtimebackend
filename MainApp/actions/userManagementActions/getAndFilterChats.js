"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndFilterChats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAndFilterChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = req.query.searchTerm;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        // If no search term, return recent conversations
        if (!searchTerm) {
            const conversations = yield prisma.conversation.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                    profile: {
                                        select: {
                                            phoneNumber: true,
                                            firstName: true,
                                            lastName: true,
                                            profilePicture: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    messages: {
                        take: 1,
                        orderBy: {
                            createdAt: "desc",
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                take: limit,
                skip: skip,
            });
            const total = yield prisma.conversation.count();
            res.json({
                conversations,
                totalResults: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            });
            return;
        }
        // Perform parallel searches
        const [users, conversations, groups] = yield Promise.all([
            // Search users with their profiles
            prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                        {
                            profile: {
                                OR: [
                                    { firstName: { contains: searchTerm, mode: "insensitive" } },
                                    { lastName: { contains: searchTerm, mode: "insensitive" } },
                                    {
                                        phoneNumber: { contains: searchTerm, mode: "insensitive" },
                                    },
                                    { nickname: { contains: searchTerm, mode: "insensitive" } },
                                ],
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                            profilePicture: true,
                            gender: true,
                            bio: true,
                            nickname: true,
                            userId: true,
                            blockedBy: true,
                        },
                    },
                },
                take: limit,
                skip: skip,
            }),
            // Search conversations
            prisma.conversation.findMany({
                where: {
                    OR: [
                        {
                            messages: {
                                some: {
                                    content: { contains: searchTerm, mode: "insensitive" },
                                },
                            },
                        },
                        {
                            participants: {
                                some: {
                                    user: {
                                        OR: [
                                            { name: { contains: searchTerm, mode: "insensitive" } },
                                            {
                                                profile: {
                                                    OR: [
                                                        {
                                                            firstName: {
                                                                contains: searchTerm,
                                                                mode: "insensitive",
                                                            },
                                                        },
                                                        {
                                                            lastName: {
                                                                contains: searchTerm,
                                                                mode: "insensitive",
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    profile: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            phoneNumber: true,
                                            profilePicture: true,
                                            gender: true,
                                            bio: true,
                                            nickname: true,
                                            userId: true,
                                            blockedBy: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    messages: {
                        where: {
                            content: { contains: searchTerm, mode: "insensitive" },
                        },
                        take: 3,
                        orderBy: {
                            createdAt: "desc",
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                take: limit,
                skip: skip,
            }),
            // Search groups
            prisma.group.findMany({
                where: {
                    name: { contains: searchTerm, mode: "insensitive" },
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            profile: {
                                select: {
                                    profilePicture: true,
                                },
                            },
                        },
                    },
                    admin: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profile: {
                                        select: {
                                            profilePicture: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                take: limit,
                skip: skip,
            }),
        ]);
        // Get total counts for pagination
        const [totalUsers, totalConversations, totalGroups] = yield Promise.all([
            prisma.user.count({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                        {
                            profile: {
                                OR: [
                                    { firstName: { contains: searchTerm, mode: "insensitive" } },
                                    { lastName: { contains: searchTerm, mode: "insensitive" } },
                                    {
                                        phoneNumber: { contains: searchTerm, mode: "insensitive" },
                                    },
                                ],
                            },
                        },
                    ],
                },
            }),
            prisma.conversation.count({
                where: {
                    OR: [
                        {
                            messages: {
                                some: {
                                    content: { contains: searchTerm, mode: "insensitive" },
                                },
                            },
                        },
                        {
                            participants: {
                                some: {
                                    user: {
                                        name: { contains: searchTerm, mode: "insensitive" },
                                    },
                                },
                            },
                        },
                    ],
                },
            }),
            prisma.group.count({
                where: {
                    name: { contains: searchTerm, mode: "insensitive" },
                },
            }),
        ]);
        const response = {
            users,
            conversations,
            groups,
            totalResults: totalUsers + totalConversations + totalGroups,
        };
        console.log(Object.assign(Object.assign({}, response), { currentPage: page, totalPages: Math.ceil(response.totalResults / limit) }));
        res.json(Object.assign(Object.assign({}, response), { currentPage: page, totalPages: Math.ceil(response.totalResults / limit) }));
        return;
    }
    catch (error) {
        console.error("Error in search:", error);
        res.status(500).json({
            error: "An error occurred while searching",
            details: process.env.NODE_ENV === "development" ? error : undefined,
        });
        return;
    }
});
exports.getAndFilterChats = getAndFilterChats;
