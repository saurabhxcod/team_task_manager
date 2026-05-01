import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().max(120).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('Todo', 'In Progress', 'Review', 'Done').default('Todo'),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  project_id: Joi.string().uuid().required(),
  assignee_id: Joi.string().uuid().allow(null),
  due_date: Joi.date().min('now').allow(null).messages({
    'date.min': 'Due date cannot be in the past on create'
  })
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().max(120),
  description: Joi.string().allow('', null),
  priority: Joi.string().valid('Low', 'Medium', 'High'),
  assignee_id: Joi.string().uuid().allow(null),
  due_date: Joi.date().allow(null)
});

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('Todo', 'In Progress', 'Review', 'Done').required()
});
