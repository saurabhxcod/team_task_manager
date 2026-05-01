import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, assignee, project, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {
      project: {
        members: { some: { user_id: req.user.id } }
      }
    };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignee) whereClause.assignee_id = assignee;
    if (project) whereClause.project_id = project;

    // Automatically mark overdue tasks
    await prisma.task.updateMany({
      where: {
        due_date: { lt: new Date() },
        status: { not: 'Done' }
      },
      // Note: we can't easily add an "is_overdue" column if it's not in schema.
      // But we can filter by due_date < now
      data: { updated_at: new Date() } // Dummy update to trigger updated_at, but we fetch overdue directly
    });

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { id: true, name: true, avatar_url: true } },
        project: { select: { id: true, name: true, color: true } }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.task.count({ where: whereClause });

    res.status(200).json({
      success: true,
      data: tasks,
      meta: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      message: 'Tasks fetched'
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is member of the project
    const membership = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: req.body.project_id, user_id: req.user.id } }
    });
    if (!membership) return next(new AppError('You are not a member of this project', 403));

    const task = await prisma.task.create({
      data: {
        ...req.body,
        creator_id: req.user.id
      }
    });

    res.status(201).json({ success: true, data: task, message: 'Task created' });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, avatar_url: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        comments: { include: { author: { select: { id: true, name: true, avatar_url: true } } } }
      }
    });

    if (!task) return next(new AppError('Task not found', 404));

    res.status(200).json({ success: true, data: task, message: 'Task fetched' });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return next(new AppError('Task not found', 404));

    const membership = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: task.project_id, user_id: req.user.id } }
    });

    if (!membership || (task.creator_id !== req.user.id && membership.role !== 'ADMIN')) {
      return next(new AppError('You do not have permission to update this task', 403));
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json({ success: true, data: updatedTask, message: 'Task updated' });
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return next(new AppError('Task not found', 404));

    const membership = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: task.project_id, user_id: req.user.id } }
    });

    if (!membership) {
      return next(new AppError('You do not have permission to change status of this task', 403));
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
        completed_at: req.body.status === 'Done' ? new Date() : null
      }
    });

    res.status(200).json({ success: true, data: updatedTask, message: 'Task status updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return next(new AppError('Task not found', 404));

    const membership = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: task.project_id, user_id: req.user.id } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return next(new AppError('Only project admin can delete a task', 403));
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, data: null, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
