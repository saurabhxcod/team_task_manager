import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectIds = (await prisma.projectMember.findMany({
      where: { user_id: req.user.id },
      select: { project_id: true }
    })).map(m => m.project_id);

    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { project_id: { in: projectIds } },
      _count: { _all: true }
    });

    const stats = {
      Todo: 0,
      'In Progress': 0,
      Review: 0,
      Done: 0
    };

    tasks.forEach(t => {
      stats[t.status as keyof typeof stats] = t._count._all;
    });

    res.status(200).json({ success: true, data: stats, message: 'Stats fetched' });
  } catch (err) {
    next(err);
  }
};

export const getOverdue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectIds = (await prisma.projectMember.findMany({
      where: { user_id: req.user.id },
      select: { project_id: true }
    })).map(m => m.project_id);

    const overdue = await prisma.task.findMany({
      where: {
        project_id: { in: projectIds },
        due_date: { lt: new Date() },
        status: { not: 'Done' }
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, data: overdue, message: 'Overdue tasks fetched' });
  } catch (err) {
    next(err);
  }
};

export const getWorkload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectIds = (await prisma.projectMember.findMany({
      where: { user_id: req.user.id },
      select: { project_id: true }
    })).map(m => m.project_id);

    const workload = await prisma.task.groupBy({
      by: ['assignee_id'],
      where: { 
        project_id: { in: projectIds },
        assignee_id: { not: null },
        status: { not: 'Done' }
      },
      _count: { _all: true }
    });


    const data = await Promise.all(workload.map(async w => {
      const user = await prisma.user.findUnique({ where: { id: w.assignee_id! }, select: { name: true, avatar_url: true } });
      return {
        user_id: w.assignee_id,
        name: user?.name,
        avatar_url: user?.avatar_url,
        task_count: w._count._all
      };
    }));

    res.status(200).json({ success: true, data, message: 'Workload fetched' });
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectIds = (await prisma.projectMember.findMany({
      where: { user_id: req.user.id },
      select: { project_id: true }
    })).map(m => m.project_id);


    const tasks = await prisma.task.findMany({
      where: { project_id: { in: projectIds } },
      orderBy: { updated_at: 'desc' },
      take: 10,
      include: { project: { select: { name: true } }, assignee: { select: { name: true } } }
    });

    res.status(200).json({ success: true, data: tasks, message: 'Activity fetched' });
  } catch (err) {
    next(err);
  }
};
