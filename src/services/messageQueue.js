// Simple in-memory message queue for ESP32 devices
class MessageQueue {
    constructor() {
        this.queue = new Map();
    }

    // Add a message to the queue for a specific SIM number
    addMessage(simNumber, message) {
        if (!simNumber) {
            console.error('Cannot add message: SIM number is required');
            return false;
        }
        
        console.log(`Adding message to queue for SIM ${simNumber}:`, message);
        
        if (!this.queue.has(simNumber)) {
            this.queue.set(simNumber, []);
        }
        
        this.queue.get(simNumber).push({
            message,
            timestamp: new Date().toISOString()
        });
        
        // Limit queue size to prevent memory issues (keep latest 20 messages)
        const messages = this.queue.get(simNumber);
        if (messages.length > 20) {
            this.queue.set(simNumber, messages.slice(-20));
        }
        
        return true;
    }

    // Get all messages for a specific SIM number
    getMessages(simNumber) {
        if (!simNumber) {
            console.error('Cannot get messages: SIM number is required');
            return [];
        }
        
        const messages = this.queue.has(simNumber) ? this.queue.get(simNumber) : [];
        console.log(`Retrieved ${messages.length} messages for SIM ${simNumber}`);
        return messages;
    }

    // Clear messages for a specific SIM number
    clearMessages(simNumber) {
        if (!simNumber) {
            console.error('Cannot clear messages: SIM number is required');
            return false;
        }
        
        if (this.queue.has(simNumber)) {
            console.log(`Clearing message queue for SIM ${simNumber}`);
            this.queue.set(simNumber, []);
            return true;
        }
        
        return false;
    }

    // Check if there are messages for a specific SIM number
    hasMessages(simNumber) {
        if (!simNumber) {
            console.error('Cannot check messages: SIM number is required');
            return false;
        }
        
        const hasMessages = this.queue.has(simNumber) && this.queue.get(simNumber).length > 0;
        console.log(`SIM ${simNumber} has messages: ${hasMessages}`);
        return hasMessages;
    }
}

// Create and export a singleton instance
const messageQueue = new MessageQueue();

module.exports = messageQueue; 