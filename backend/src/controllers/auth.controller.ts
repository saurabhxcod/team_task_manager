import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);


    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { user_id: user.id, token: refreshToken, expires_at: expiresAt }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, accessToken },
      message: 'Signup successful'
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { user_id: user.id, token: refreshToken, expires_at: expiresAt }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, accessToken },
      message: 'Login successful'
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(new AppError('No refresh token provided', 401));

    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expires_at < new Date()) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken(decoded.id);

    res.status(200).json({ success: true, data: { accessToken }, message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ success: true, data: { user: { id: req.user.id, name: req.user.name, email: req.user.email, avatar_url: req.user.avatar_url } } });
  } catch (err) {
    next(err);
  }
};
