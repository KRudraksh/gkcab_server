const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operationController');

// GET /api/operations/:machineId - Get operations for a specific machine
router.get('/:machineId', operationController.getOperations);

// POST /api/operations - Create a new operation record
router.post('/', operationController.createOperation);

// DELETE /api/operations/:id - Delete an operation record
router.delete('/:id', operationController.deleteOperation);

module.exports = router; 