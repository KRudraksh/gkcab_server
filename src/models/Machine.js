const mongoose = require('mongoose');

// Machine schema
const machineSchema = new mongoose.Schema({
    machineName: String,
    simNumber: String,
    username: String,
    remarks: String,
    status: { type: String, default: 'OFFLINE' },
    sensorStatus: { type: String, default: 'None' },
    location: { type: String, default: 'None' },
    serverConnection: { type: String, default: 'OFFLINE' },
    lastStatusUpdate: { type: Date, default: null },
    directoryNumbers: { type: [String], default: [] },
    phoneBook: { type: [String], default: [] }
}, {
    timestamps: true
});

module.exports = mongoose.model('Machine', machineSchema); 