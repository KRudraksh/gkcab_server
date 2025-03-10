const Machine = require('../models/Machine');
const User = require('../models/User');

// Get all machines (with optional username filter)
const getMachines = async (req, res) => {
    try {
        const { username } = req.query;
        let query = {};
        
        // If username is provided, filter machines by username
        if (username) {
            query.username = username;
        }
        
        const machines = await Machine.find(query);
        res.status(200).json(machines);
    } catch (error) {
        res.status(500).send('Error fetching machines');
    }
};

// Add a new machine
const createMachine = async (req, res) => {
    const { machineName, simNumber, remarks, username } = req.body;
    const newMachine = new Machine({
        machineName,
        simNumber,
        username, // Save the username with the machine
        remarks,
        status: 'OFFLINE', // Set default status
        sensorStatus: 'None', // Set default sensor status
        location: 'None', // Set default location
        serverConnection: 'OFFLINE', // Set default server connection status
        phoneBook: [], // Set default phoneBook value
    });

    try {
        await newMachine.save();
        
        // Update the user's machine count
        await User.findOneAndUpdate(
            { username: username }, // Find the user by username
            { $inc: { machineCount: 1 } } // Increment the machineCount by 1
        );

        res.status(201).send('Machine added successfully');
    } catch (error) {
        res.status(400).send('Error adding machine');
    }
};

// Delete a machine
const deleteMachine = async (req, res) => {
    const { id } = req.params;
    
    try {
        const machine = await Machine.findById(id);
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        await Machine.findByIdAndDelete(id);
        
        // Decrement the user's machine count
        if (machine.username) {
            await User.findOneAndUpdate(
                { username: machine.username },
                { $inc: { machineCount: -1 } }
            );
        }
        
        res.status(200).send('Machine deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting machine');
    }
};

// Reset all machine statuses to OFFLINE
const resetStatus = async (req, res) => {
    try {
        // Update all machines to set status to OFFLINE
        await Machine.updateMany(
            {}, // Empty filter means all documents
            { 
                $set: { 
                    status: 'OFFLINE'
                } 
            }
        );
        
        res.status(200).send('All machines status reset to OFFLINE');
    } catch (error) {
        res.status(500).send('Error resetting machine statuses');
    }
};

// Save directory numbers for a specific machine
const saveDirectoryNumbers = async (req, res) => {
    try {
        const { machineId } = req.params;
        const { directoryNumbers, username } = req.body;
        
        if (!Array.isArray(directoryNumbers)) {
            return res.status(400).send('directoryNumbers must be an array');
        }
        
        // Find the machine first to verify ownership
        const machine = await Machine.findById(machineId);
        
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        // If username is provided and doesn't match the machine's username, return 403
        if (username && machine.username && machine.username !== username) {
            return res.status(403).send('Not authorized to update this machine');
        }
        
        await Machine.findByIdAndUpdate(
            machineId,
            { directoryNumbers },
            { new: true }
        );
        
        res.status(200).send('Directory numbers saved successfully');
    } catch (error) {
        res.status(500).send('Error saving directory numbers');
    }
};

// Get directory numbers for a specific machine
const getDirectoryNumbers = async (req, res) => {
    try {
        const { machineId } = req.params;
        const { username } = req.query; // Get username from query params
        
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        // If username is provided and doesn't match the machine's username, return 403
        if (username && machine.username && machine.username !== username) {
            return res.status(403).send('Not authorized to access this machine');
        }
        
        res.status(200).json({ directoryNumbers: machine.directoryNumbers || [] });
    } catch (error) {
        res.status(500).send('Error fetching directory numbers');
    }
};

// Update a machine
const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Find the machine first to verify it exists
        const machine = await Machine.findById(id);
        
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        // If username is provided in the update and doesn't match the machine's username, return 403
        if (updateData.username && machine.username && updateData.username !== machine.username) {
            return res.status(403).send('Not authorized to update this machine');
        }
        
        const updatedMachine = await Machine.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        // Update the last data update time
        global.lastDataUpdateTime = new Date().toISOString();
        
        res.status(200).json(updatedMachine);
    } catch (error) {
        res.status(500).send('Error updating machine');
    }
};

module.exports = {
    getMachines,
    createMachine,
    deleteMachine,
    resetStatus,
    saveDirectoryNumbers,
    getDirectoryNumbers,
    updateMachine
}; 