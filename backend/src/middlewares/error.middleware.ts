import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      }
    });
  } else {

    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        error: { message: err.message }
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        error: { message: 'Something went very wrong!' }
      });
    }
  }
};
