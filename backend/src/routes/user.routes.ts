import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();


router.get('/', verifyToken, userController.listUsers);
router.get('/:id', verifyToken, userController.getUser);
router.patch('/:id', verifyToken, userController.updateProfile);
router.patch('/:id/password', verifyToken, userController.changePassword);

export default router;
