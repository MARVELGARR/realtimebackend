import type { Request, RequestHandler, Response } from "express"
import { prisma } from "../../configs/prisma"
import { Prisma } from "@prisma/client"

const getSearchUsers: RequestHandler = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query

  const pageNumber = page ? Number.parseInt(page as string) : 1
  const limitNumber = limit ? Number.parseInt(limit as string) : 5
  const skip = (pageNumber - 1) * limitNumber

  try {
    // Create the where condition for the query
    const whereCondition =
      search && search !== ""
        ? {
            OR: [
              {
                name: {
                  contains: search as string,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                profile: {
                  OR: [
                    { firstName: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
                    { lastName: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
                    { phoneNumber: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
                    { nickname: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
                  ],
                },
              },
            ],
          }
        : {} // Empty condition if no search term

    // Get users based on the query parameters
    const users = await prisma.user.findMany({
      where: whereCondition,
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
        createdAt: "desc",
      },
    })

    // Count total matching users for pagination
    const totalUsers = await prisma.user.count({
      where: whereCondition,
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limitNumber)
    const hasNextPage = pageNumber < totalPages

    // Return structured response with users and pagination info
    res.status(200).json({
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        hasNextPage,
        totalUsers,
        limit: limitNumber,
      },
    })
    return
  } catch (error) {
    console.error("Error searching users:", error)
    res.status(500).json({ error: "Something went wrong while searching users" })
    return
  }
}

export default getSearchUsers

