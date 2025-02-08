
import nodemailer from 'nodemailer';
import dotenv from "dotenv"
dotenv.config()

export const sendResetEmail = async (email: string, resetLink: string, Subject?: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: Subject,
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};