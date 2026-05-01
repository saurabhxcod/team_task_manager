import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { signupSchema, loginSchema } from '../validations/auth.validation';
import { verifyToken } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', verifyToken, authController.getMe);

export default router;
