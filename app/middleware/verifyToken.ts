import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { SessionPayload } from '../actions/createSession';
import { prisma } from '../configs/prisma';

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


  if (!sessionID) {
    return res.status(401).json({ error: 'No session ID provided' });
  }

  try {
    // Find the session in the database by session ID
    const session = await prisma.session.findUnique({
      where: { id: sessionID },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Optionally, you can validate JWT from the session
    const decoded = jwt.verify(session.sessionToken, process.env.JWT_SECRET!) as SessionPayload;



    console.log("Decoded token:", decoded);

    req.user  = decoded; // Attach user data to request object
    next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token has expired, please log in again' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            const session = await prisma.session.findUnique({
                where: { id: sessionID },
              });
              if (!session) {
                return res.status(401).json({ error: 'Session not found, please log in again' });
            }
        
            const refreshToken = session.refreshToken;
        
            if (!refreshToken) {
                return res.status(401).json({ error: 'No refresh token found, please log in again' });
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

                res.cookie('sessionID', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 24 * 60 * 60 * 1000, 
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  });
        
                  return res.status(200).json({ message: "Token refreshed successfully" });
            } catch (refreshError) {
                return res.status(401).json({ error: 'Refresh token invalid, please log in again' });
            }
        } else {
            console.error("Token verification failed:", error);
            res.status(500).json({ error: 'Something went wrong with token verification' });
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
                profile: true,
                
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
    res.clearCookie('token'); // Clear the session token cookie
    res.status(200).json({ message: 'Logged out successfully' });
};
  