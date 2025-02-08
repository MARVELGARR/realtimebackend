import { PrismaClient } from '@prisma/client';
import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from './sendEmail';

const prisma = new PrismaClient();

export const forgotPassword: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Don't reveal if user exists
    if (!user) {
       res.status(200).json({
        message: 'If an account exists with this email, you will receive a password reset link'
      });
      return
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );



    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/resetingPassword?token=${resetToken}&userId=${user.id}`;
    const subject = "Password rest"
    // Send email
    await sendResetEmail(email, resetLink, subject);

    res.status(200).json({
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: `Failed to process password reset request${error}`});
  }
};