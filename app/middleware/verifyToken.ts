import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../configs/prisma';
import { SessionPayload } from '../actions/authActions/createSession';

declare global {
    namespace Express {
      interface Request {
        user?: SessionPayload;
      }
    }
}

export const authenticateToken : RequestHandler = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<any> => {
    const sessionID = req.cookies.sessionID;

  if (!sessionID || sessionID === "null") {
     res.status(401).json({ error: 'No session ID provided' });
     return
  }

  try {
    // Find the session in the database by 
    // session ID
    const session = await prisma.session.findUnique({
      where: { id: sessionID },
    });

    if (!session) {
       res.status(401).json({ error: 'session dosent exist pls login again' });
       return
    }

    // Optionally, you can validate JWT from the session
    const decoded = jwt.verify(session.sessionToken, process.env.JWT_SECRET!) as SessionPayload;



    console.log("Decoded token:", decoded);

    req.user  = decoded; // Attach user data to request object
    next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const session = await prisma.session.findUnique({
                where: { id: sessionID },
            });
            if (!session) {
                 res.status(401).json({ error: 'Session not found, please log in again' });
                 return 
            }
        
            const refreshToken = session.refreshToken;
        
            if (!refreshToken) {
                 res.status(401).json({ error: 'No refresh token found, please log in again' });
                 return
            }
            try {
                // Verify the refresh token
                const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
                
                // Generate a new access token
                const newAccessToken = jwt.sign(
                    { userId: decoded.userId, email: decoded.email },
                    process.env.JWT_SECRET!,
                    { expiresIn: '15m' }
                );

                const updatedSession = await prisma.session.update({
                    where: { id: sessionID},
                    data: {
                        sessionToken: newAccessToken
                    }
                })

                if(updatedSession){


                    res.cookie('sessionData', updatedSession.id), {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 24 * 60 * 60 * 1000,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    };

                }
                else{
                    
                    res.status(200).json({ error: "Token refresh error" });
                    return
                }


            } catch (refreshError) {
                res.status(401).json({ error: refreshError });
                return 
            }
            
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({error: 'token error'})
            return
        } else {
            console.error("Token verification failed:", error);
            res.status(500).json({ error: error });
            return
        }
    }
};
  

export const getUserData: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.email) {
        res.status(400).json({ error: 'User email is missing from the token' });
        return next();
    }    
    try {
        
        const user = await prisma.user.findUnique({
            where: { email: req.user.email as string },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                profile: {
                    include: {
                        privacy: true
                    }
                },
                
                
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return next();
        }

        res.status(200).json(user);
        return next();
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to retrieve user data' });
        return next();
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('sessionID');
    res.status(200).json({ message: 'Logged out successfully' });
};
  