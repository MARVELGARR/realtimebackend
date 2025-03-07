import { Request, RequestHandler, Response } from "express";
import { prisma } from "../../configs/prisma";

const logout: RequestHandler = async (req: Request, res: Response) => {
    const sessionId = req.cookies.sessionID;

    if (!sessionId) {
         res.status(400).json({ error: "No session ID found in cookies" });
         return
    }

    try {
        const deletedSession = await prisma.session.delete({
            where: { id: sessionId }
        });

        if (deletedSession) {
            res.clearCookie('sessionID', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                
            });

             res.status(200).json({ message: "Logout successful" });
             return
        } else {
             res.status(500).json({ error: "Failed to delete session" });
             return
        }
    } catch (error) {
        console.error('Logout error:', error);
         res.status(500).json({ error: 'Internal server error' });
         return
    }
};

export default logout;