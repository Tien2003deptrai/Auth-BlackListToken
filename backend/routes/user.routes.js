const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { 
  updateProfileSchema, 
  updateUserSchema 
} = require('../validations/user.validation');

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getCurrentUser);

// Update current user profile
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Admin only routes
router.get('/', authorize(['admin']), userController.getAllUsers);
router.get('/:id', authorize(['admin']), userController.getUserById);
router.put('/:id', authorize(['admin']), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;