const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    email: String,
    machineCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 