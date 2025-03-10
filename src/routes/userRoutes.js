const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Get all users
router.get('/', userController.getUsers);

// POST /api/users - Create a new user
router.post('/', userController.createUser);

// DELETE /api/users/:id - Delete a user
router.delete('/:id', userController.deleteUser);

// POST /api/users/login - User login
router.post('/login', userController.login);

// POST /api/users/admin/login - Admin login
router.post('/admin/login', userController.adminLogin);

// POST /api/users/:id/reset-password - Reset user password
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router; 