const Joi = require('joi');

// Request validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  createNote: Joi.object({
    title: Joi.string().trim().max(255).required(),
    content: Joi.string().trim().max(10000).required(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional()
  }),
  
  updateNote: Joi.object({
    title: Joi.string().trim().max(255).optional(),
    content: Joi.string().trim().max(10000).optional(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).optional()
  }).min(1), // At least one field must be provided
  
  inviteUser: Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'member').default('member')
  })
};

module.exports = {
  validate,
  schemas
};