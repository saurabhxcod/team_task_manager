import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { user_id: req.user.id }
        }
      },
      include: {
        _count: { select: { tasks: true, members: true } }
      }
    });

    res.status(200).json({ success: true, data: projects, message: 'Projects fetched' });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, color } = req.body;

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: { name, description, color, owner_id: req.user.id }
      });
      await tx.projectMember.create({
        data: { project_id: p.id, user_id: req.user.id, role: 'ADMIN' }
      });
      return p;
    });

    res.status(201).json({ success: true, data: project, message: 'Project created' });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } } },
        _count: { select: { tasks: true } }
      }
    });
    
    if (!project) return next(new AppError('Project not found', 404));
    
    res.status(200).json({ success: true, data: project, message: 'Project fetched' });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.status(200).json({ success: true, data: project, message: 'Project updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: null, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

export const archiveProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: 'Archived' }
    });
    res.status(200).json({ success: true, data: project, message: 'Project archived' });
  } catch (err) {
    next(err);
  }
};

export const listMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { project_id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } }
    });
    res.status(200).json({ success: true, data: members, message: 'Members fetched' });
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const project_id = req.params.id;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AppError('User with this email not found', 404));

    const existing = await prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id, user_id: user.id } }
    });
    
    if (existing) return next(new AppError('User is already a member', 409));

    const member = await prisma.projectMember.create({
      data: { project_id, user_id: user.id, role }
    });

    res.status(201).json({ success: true, data: member, message: 'Member invited' });
  } catch (err) {
    next(err);
  }
};

export const updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const member = await prisma.projectMember.update({
      where: { project_id_user_id: { project_id: req.params.id, user_id: req.params.userId } },
      data: { role }
    });
    res.status(200).json({ success: true, data: member, message: 'Role updated' });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.projectMember.delete({
      where: { project_id_user_id: { project_id: req.params.id, user_id: req.params.userId } }
    });
    res.status(200).json({ success: true, data: null, message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};
