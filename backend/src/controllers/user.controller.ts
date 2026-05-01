import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar_url: true, is_active: true, created_at: true }
    });
    res.status(200).json({ success: true, data: users, message: 'Users fetched' });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, avatar_url: true, created_at: true }
    });
    if (!user) return next(new AppError('User not found', 404));
    
    res.status(200).json({ success: true, data: user, message: 'User fetched' });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(new AppError('You can only update your own profile', 403));
    }

    const { name, avatar_url } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar_url },
      select: { id: true, name: true, email: true, avatar_url: true }
    });

    res.status(200).json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(new AppError('You can only change your own password', 403));
    }

    const { old_password, new_password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await bcrypt.compare(old_password, user.password))) {
      return next(new AppError('Incorrect old password', 400));
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, data: null, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
