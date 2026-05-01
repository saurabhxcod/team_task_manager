import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validations/task.validation';

const router = Router();

router.use(verifyToken);

router.get('/', taskController.listTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

export default router;
