const mongoose = require('mongoose');

// Machine Operation schema
const machineOperationSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    fuelConsumption: {
        type: Number,
        required: true
    },
    pressure: {
        type: Number,
        required: true
    },
    processTime: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MachineOperation', machineOperationSchema); 