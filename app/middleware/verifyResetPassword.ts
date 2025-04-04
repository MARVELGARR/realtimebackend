import { Response, Request, NextFunction, RequestParamHandler, RequestHandler } from "express";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { SessionPayload } from "../actions/authActions/createSession";

declare global {
    namespace Express {
        interface Request {
            passwordReset?: SessionPayload;
        }
    }
}

dotenv.config();

const verifyResetPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const secret = process.env.JWT_SECRET!;

    if (typeof token !== 'string') {
         res.status(400).json({ error: 'Invalid token' });
         return
    }

    try {
        const verify = jwt.verify(token, secret) as SessionPayload;
        req.passwordReset = verify;
        res.status(200).json({
            message: "verification success",
            token: `${token}`
        })
        next()
    } catch (error) {
        console.error('Token verification error:', error);
         res.status(400).json({ error: 'Invalid or expired token' });
         return
    }
};

export default verifyResetPassword;