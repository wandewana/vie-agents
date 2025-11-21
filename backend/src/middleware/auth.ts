import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    username: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};