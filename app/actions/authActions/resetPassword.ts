import { Response, Request, RequestHandler } from "express";
import { prisma } from "../../configs/prisma";
import bcrypt from 'bcrypt';

const resetPassword: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { newPassword } = req.body;
        const details = req.passwordReset;

        if (!details || !details.email) {
             res.status(400).json({ message: "Invalid or expired token" });
             return
        }

        const user = await prisma.user.findUnique({
            where: { email: details.email }
        });

        if (!user) {
             res.status(400).json({ message: "User not found" });
             return
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        const updateUser = await prisma.user.update({
            where: { email: user.email! },
            data: { password: encryptedPassword }
        });

        if (updateUser) {
             res.status(200).json({ message: "Password changed successfully" });
        } else {
             res.status(500).json({ message: "Error changing password" });
        }
    } catch (error) {
        console.error('Error resetting password:', error);
         res.status(500).json({ message: "Internal server error" });
         return
    }
};

export default resetPassword;