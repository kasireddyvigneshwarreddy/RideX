import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  driverProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'ridex_super_secret_jwt_key_2026_production_grade_token';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. Please provide a valid Bearer token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { driverProfile: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or has been revoked.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      driverProfileId: user.driverProfile?.id,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { driverProfile: true },
      });
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          driverProfileId: user.driverProfile?.id,
        };
      }
    }
    next();
  } catch {
    next();
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const allowed = Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles;
    if (!allowed) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${Array.isArray(roles) ? roles.join(' or ') : roles} role.`,
      });
      return;
    }

    next();
  };
};
