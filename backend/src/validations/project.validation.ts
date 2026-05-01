import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  color: Joi.string().allow('', null)
});

export const updateProjectSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
  status: Joi.string().valid('Active', 'Archived', 'Planning')
});

export const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('ADMIN', 'MEMBER').default('MEMBER')
});

export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'MEMBER').required()
});
