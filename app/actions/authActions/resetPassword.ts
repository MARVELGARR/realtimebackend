import { Response, Request, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { SessionPayload } from "./createSession";

dotenv.config();

const resetPassword: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        const token = req.query.token as string;

        const secret = process.env.JWT_SECRET!;
        const verify = jwt.verify(token, secret) as unknown as SessionPayload;

        const user = await prisma.user.findUnique({
            where: { email: verify.email as string }
        });

        if (!user) {
             res.status(400).json({ error: "User not found" });
             return
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const updateUser = await prisma.user.update({
            where: { email: user.email! },
            data: { password: encryptedPassword }
        });

        if (updateUser) {
             res.status(200).json({ message: "Password changed successfully" });
             return
        } else {
             res.status(500).json({ error: "Error changing password" });
             return
        }
    } catch (error) {
        console.error('Error resetting password:', error);
         res.status(500).json({ error: "Internal server error" });
         return
    }
};

export default resetPassword;