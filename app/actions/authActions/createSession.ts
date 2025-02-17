import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { prisma } from '../../configs/prisma';

export interface SessionPayload {
  userId: string;
  email: string | null;
  name: string | null;
}

export const createSessionForUser = async (user: User) => {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  }
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: '15m',
      issuer: 'realtime',
      audience: 'realtimers',
    }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: '7d',
      issuer: 'realtime',
      audience: 'realtimers',
    }
  );

  const newUserSession = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Corrected expiration time calculation
      sessionToken: token,
      refreshToken: refreshToken,
    }
  });

  if (newUserSession) {
    return { sessionId: newUserSession.id };
  } else {
    throw new Error('Failed to create session'); // Throw an error instead of returning an error object
  }
};