import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/stats', dashboardController.getStats);
router.get('/overdue', dashboardController.getOverdue);
router.get('/workload', dashboardController.getWorkload);
router.get('/activity', dashboardController.getActivity);

export default router;
