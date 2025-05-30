const Joi = require('joi');

// Update profile validation schema
const updateProfileSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address'
    })
});

// Admin update user validation schema
const updateUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  role: Joi.string()
    .valid('user', 'admin')
    .messages({
      'any.only': 'Role must be either user or admin'
    }),
  
  isActive: Joi.boolean()
});

module.exports = {
  updateProfileSchema,
  updateUserSchema
};