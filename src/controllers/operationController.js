const MachineOperation = require('../models/MachineOperation');
const Machine = require('../models/Machine');

// Get operations for a specific machine
const getOperations = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        // Find operations for the specified machine
        const operations = await MachineOperation.find({ machineId })
            .sort({ dateTime: -1 }) // Sort by date (newest first)
            .limit(50); // Limit to the most recent 50 operations
        
        res.status(200).json(operations);
    } catch (error) {
        res.status(500).send('Error fetching operations');
    }
};

// Create a new operation record
const createOperation = async (req, res) => {
    try {
        const { machineId, fuelConsumption, pressure, processTime, location } = req.body;
        
        // Verify that the machine exists
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        // Create new operation record
        const newOperation = new MachineOperation({
            machineId,
            fuelConsumption,
            pressure,
            processTime,
            location
        });
        
        await newOperation.save();
        
        // Update the last data update time
        global.lastDataUpdateTime = new Date().toISOString();
        
        res.status(201).send('Operation record created successfully');
    } catch (error) {
        res.status(400).send('Error creating operation record');
    }
};

// Delete an operation record
const deleteOperation = async (req, res) => {
    try {
        const { id } = req.params;
        
        await MachineOperation.findByIdAndDelete(id);
        
        res.status(200).send('Operation deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting operation');
    }
};

module.exports = {
    getOperations,
    createOperation,
    deleteOperation
}; 