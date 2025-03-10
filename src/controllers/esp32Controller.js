const Machine = require('../models/Machine');
const MachineOperation = require('../models/MachineOperation');
const messageQueue = require('../services/messageQueue');

// Handle incoming data from ESP32 devices
const receiveData = async (req, res) => {
    console.log('------------ ESP32+SIM800L POST REQUEST ------------');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body:', req.body);
    console.log('---------------------------------------------------');
    
    // Extract all data from the request first
    const { cmd, simNumber, status, sensorStatus, location, job, fuelConsumption, pressure, processTime, count, phoneBook } = req.body;
    
    // Handle the get_status command from client
    if (cmd === 'get_status' && simNumber) {
        console.log(`Received get_status command for SIM: ${simNumber}`);
        
        // Queue a get_status command for the device
        messageQueue.addMessage(simNumber, 'cmd=get_status');
        
        // Update global last update time
        global.lastDataUpdateTime = new Date().toISOString();
        
        return res.status(200).send('Get status command queued successfully');
    }
    
    // Handle directory update command from client
    if (cmd === 'dir_update' && simNumber) {
        console.log(`Received directory update command for SIM: ${simNumber}`);
        
        // Build directory update message
        let dirUpdateMessage = `cmd=dir_update&count=${count || 0}`;
        
        // Add all numbers to the message
        const numCount = parseInt(count) || 0;
        for (let i = 1; i <= numCount; i++) {
            const numKey = `number${i}`;
            if (req.body[numKey]) {
                dirUpdateMessage += `&${numKey}=${encodeURIComponent(req.body[numKey])}`;
            }
        }
        
        // Queue the message
        messageQueue.addMessage(simNumber, dirUpdateMessage);
        
        // Update global last update time
        global.lastDataUpdateTime = new Date().toISOString();
        
        return res.status(200).send('Directory update command queued successfully');
    }
    
    // Handle STATUS_UPDATE command from ESP32
    if (cmd === 'STATUS_UPDATE' && simNumber) {
        console.log(`Received STATUS_UPDATE from SIM: ${simNumber}`);
        
        try {
            // Find machines with this SIM number
            const machines = await Machine.find({ simNumber });
            
            if (machines.length > 0) {
                // Update all machines with this SIM number
                for (const machine of machines) {
                    const updates = {
                        status: status || machine.status,
                        serverConnection: 'ONLINE',
                        lastStatusUpdate: new Date()
                    };
                    
                    if (sensorStatus) updates.sensorStatus = sensorStatus;
                    if (location) updates.location = location;
                    
                    // Process phoneBook if provided
                    if (phoneBook) {
                        try {
                            console.log('Processing phoneBook data:', phoneBook);
                            
                            let phoneBookArray;
                            
                            // Check if phoneBook is already a valid array
                            if (Array.isArray(phoneBook)) {
                                phoneBookArray = phoneBook;
                            } else {
                                // Try to parse the phoneBook as JSON
                                try {
                                    // First decode any URL-encoded characters
                                    const decodedPhoneBook = decodeURIComponent(phoneBook);
                                    console.log('Decoded phoneBook:', decodedPhoneBook);
                                    
                                    // Then parse as JSON
                                    phoneBookArray = JSON.parse(decodedPhoneBook);
                                    console.log('Parsed phoneBook:', phoneBookArray);
                                    
                                    // Ensure it's an array
                                    if (!Array.isArray(phoneBookArray)) {
                                        console.error('phoneBook is not an array after parsing:', phoneBookArray);
                                        phoneBookArray = [phoneBook]; // Fallback to a single-item array
                                    }
                                } catch (parseError) {
                                    console.error('Error parsing phoneBook:', parseError);
                                    // If parse fails, use phoneBook as a string in an array
                                    phoneBookArray = [phoneBook];
                                }
                            }
                            
                            // Filter out empty strings
                            phoneBookArray = phoneBookArray.filter(entry => entry && entry.trim() !== '');
                            
                            console.log('Final phoneBook array:', phoneBookArray);
                            updates.phoneBook = phoneBookArray;
                        } catch (phoneBookError) {
                            console.error('Error processing phoneBook data:', phoneBookError);
                        }
                    }
                    
                    await Machine.findByIdAndUpdate(machine._id, updates);
                }
                
                // Update lastDataUpdateTime when machines are updated
                global.lastDataUpdateTime = new Date().toISOString();
                
                console.log(`Updated ${machines.length} machine(s) with SIM number: ${simNumber}`);
                return res.status(200).send('STATUS_UPDATE processed successfully');
            } else {
                console.log(`No machines found with SIM number: ${simNumber}`);
                return res.status(404).send('No machines found with this SIM number');
            }
        } catch (error) {
            console.error('Error processing STATUS_UPDATE:', error);
            return res.status(500).send('Error processing STATUS_UPDATE');
        }
    }
    
    // Handle JOB command from ESP32
    if (cmd === 'JOB' && simNumber) {
        console.log(`Received JOB command from SIM: ${simNumber}`);
        
        try {
            // Find machines with this SIM number
            const machines = await Machine.find({ simNumber });
            
            if (machines.length > 0) {
                // Create operation records for all machines with this SIM number
                for (const machine of machines) {
                    // Create a new operation record
                    const newOperation = new MachineOperation({
                        machineId: machine._id,
                        dateTime: new Date(),
                        fuelConsumption: parseFloat(fuelConsumption) || 0,
                        pressure: parseFloat(pressure) || 0,
                        processTime: parseInt(processTime) || 0,
                        location: location || 'Unknown'
                    });
                    
                    // Save the new operation to the database
                    await newOperation.save();
                }
                
                // Update the machine status to ONLINE
                for (const machine of machines) {
                    await Machine.findByIdAndUpdate(machine._id, {
                        status: 'ONLINE',
                        serverConnection: 'ONLINE',
                        lastStatusUpdate: new Date(),
                        location: location || machine.location
                    });
                }
                
                // Update lastDataUpdateTime when a new operation is created
                global.lastDataUpdateTime = new Date().toISOString();
                
                console.log(`Created new operation records for ${machines.length} machine(s) with SIM number: ${simNumber}`);
                return res.status(200).send('JOB data processed successfully');
            } else {
                console.log(`No machines found with SIM number: ${simNumber}`);
                return res.status(404).send('No machines found with this SIM number');
            }
        } catch (error) {
            console.error('Error processing JOB data:', error);
            return res.status(500).send('Error processing JOB data');
        }
    }
    
    // Handle regular data updates
    if (!simNumber) {
        return res.status(400).send('SIM number is required');
    }
    
    try {
        // Find machines with this SIM number
        const machines = await Machine.find({ simNumber });
        
        if (machines.length > 0) {
            // Update all machines with this SIM number
            for (const machine of machines) {
                const updates = {
                    status: status || machine.status,
                    serverConnection: 'ONLINE',
                    lastStatusUpdate: new Date()
                };
                
                if (sensorStatus) updates.sensorStatus = sensorStatus;
                if (location) updates.location = location;
                
                await Machine.findByIdAndUpdate(machine._id, updates);
                
                // If job data is provided, create a new operation record
                if (job && fuelConsumption && pressure && processTime) {
                    const newOperation = new MachineOperation({
                        machineId: machine._id,
                        fuelConsumption: parseFloat(fuelConsumption),
                        pressure: parseFloat(pressure),
                        processTime: parseInt(processTime),
                        location: location || 'Unknown'
                    });
                    
                    await newOperation.save();
                }
            }
            
            // Update lastDataUpdateTime when machines are updated
            global.lastDataUpdateTime = new Date().toISOString();
            
            console.log(`Updated ${machines.length} machine(s) with SIM number: ${simNumber}`);
        } else {
            console.log(`No machines found with SIM number: ${simNumber}`);
        }
        
        res.status(200).send('Data received successfully');
    } catch (error) {
        console.error('Error processing ESP32 data:', error);
        res.status(500).send('Error processing data');
    }
};

// Send queued messages to ESP32 devices
const sendCommands = async (req, res) => {
    console.log('------------ ESP32+SIM800L GET REQUEST ------------');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Query params:', req.query);
    console.log('---------------------------------------------------');
    
    // Get SIM number from query parameters
    const simNumber = req.query.simNumber || 'default';
    
    // Check if there are messages for this device
    if (messageQueue.hasMessages(simNumber)) {
        // Get all messages for this device
        const messages = messageQueue.getMessages(simNumber);
        console.log(`Sending ${messages.length} messages to device with SIM: ${simNumber}:`, messages);
        
        // Create a URLSearchParams object to build the response
        const formData = new URLSearchParams();
        
        // Add each message to the response
        messages.forEach((msg, index) => {
            formData.append(`message${index + 1}`, msg.message);
            formData.append(`timestamp${index + 1}`, msg.timestamp);
        });
        
        // Clear the queue for this device
        messageQueue.clearMessages(simNumber);
        
        // Return the formatted message as application/x-www-form-urlencoded
        console.log('Sending response:', formData.toString());
        res.set('Content-Type', 'application/x-www-form-urlencoded');
        res.send(formData.toString());
    } else {
        // No messages, return empty response
        console.log('No messages for SIM:', simNumber);
        res.set('Content-Type', 'application/x-www-form-urlencoded');
        res.send('status=no_messages');
    }
};

// Request status from a specific machine
const requestStatus = async (req, res) => {
    try {
        const { machineId } = req.params;
        
        // Find the machine
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).send('Machine not found');
        }
        
        // Add a message to the queue for this machine
        const simNumber = machine.simNumber;
        if (!simNumber) {
            return res.status(400).send('Machine has no SIM number');
        }
        
        // Add the properly formatted get_status command to the queue
        messageQueue.addMessage(simNumber, 'cmd=get_status');
        
        console.log(`Status request for machine ${machineId} with SIM ${simNumber} queued`);
        res.status(200).send('Status request sent');
    } catch (error) {
        console.error('Error requesting status:', error);
        res.status(500).send('Error requesting status');
    }
};

module.exports = {
    receiveData,
    sendCommands,
    requestStatus
}; 