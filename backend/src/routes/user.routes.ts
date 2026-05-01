import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Assuming admin check for listing all users in a real app, keeping it open for now or we can add it
router.get('/', verifyToken, userController.listUsers);
router.get('/:id', verifyToken, userController.getUser);
router.patch('/:id', verifyToken, userController.updateProfile);
router.patch('/:id/password', verifyToken, userController.changePassword);

export default router;
