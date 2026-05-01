import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import prisma from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyAccessToken(token);
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (!currentUser.is_active) {
      return next(new AppError('Your account has been deactivated.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid token or token has expired', 401));
  }
};

export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) return next(new AppError('Project ID is required', 400));

    const membership = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: req.user.id
        }
      }
    });

    if (!membership) {
      return next(new AppError('You do not have access to this project', 403));
    }

    req.projectRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) return next(new AppError('Project ID is required', 400));

    const membership = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: req.user.id
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return next(new AppError('You must be a project ADMIN to perform this action', 403));
    }

    req.projectRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

declare module 'express' {
  interface Request {
    projectRole?: string;
  }
}
