import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../utils/errors';

export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const message = error.details.map(i => i.message).join(', ');
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERR',
          message: message,
          field: error.details[0].context?.key
        }
      });
    }
    
    req[property] = value;
    next();
  };
};
