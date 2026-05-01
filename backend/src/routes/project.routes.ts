import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { verifyToken, requireProjectMember, requireProjectAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProjectSchema, updateProjectSchema, inviteMemberSchema, updateMemberRoleSchema } from '../validations/project.validation';

const router = Router();

router.use(verifyToken);

router.get('/', projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);

router.get('/:id', requireProjectMember, projectController.getProject);
router.patch('/:id', requireProjectAdmin, validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireProjectAdmin, projectController.deleteProject);
router.patch('/:id/archive', requireProjectAdmin, projectController.archiveProject);

// Members routes
router.get('/:id/members', requireProjectMember, projectController.listMembers);
router.post('/:id/members/invite', requireProjectAdmin, validate(inviteMemberSchema), projectController.inviteMember);
router.patch('/:id/members/:userId/role', requireProjectAdmin, validate(updateMemberRoleSchema), projectController.updateMemberRole);
router.delete('/:id/members/:userId', requireProjectAdmin, projectController.removeMember);

export default router;
