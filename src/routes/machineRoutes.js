const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

// GET /api/machines - Get all machines (with optional username filter)
router.get('/', machineController.getMachines);

// POST /api/machines - Add a new machine
router.post('/', machineController.createMachine);

// DELETE /api/machines/:id - Delete a machine
router.delete('/:id', machineController.deleteMachine);

// POST /api/machines/reset-status - Reset all machine statuses to OFFLINE
router.post('/reset-status', machineController.resetStatus);

// POST /api/machines/:machineId/directory-numbers - Save directory numbers
router.post('/:machineId/directory-numbers', machineController.saveDirectoryNumbers);

// GET /api/machines/:machineId/directory-numbers - Get directory numbers
router.get('/:machineId/directory-numbers', machineController.getDirectoryNumbers);

// PATCH /api/machines/:id - Update a machine
router.patch('/:id', machineController.updateMachine);

module.exports = router; 