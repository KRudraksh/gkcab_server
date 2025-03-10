const express = require('express');
const router = express.Router();
const esp32Controller = require('../controllers/esp32Controller');

// POST /api/esp32data - Receive data from ESP32 devices
router.post('/esp32data', esp32Controller.receiveData);

// GET /api/esp32data - Send commands to ESP32 devices
router.get('/esp32data', esp32Controller.sendCommands);

// POST /api/getStatus/:machineId - Request status from a specific machine
router.post('/getStatus/:machineId', esp32Controller.requestStatus);

module.exports = router; 