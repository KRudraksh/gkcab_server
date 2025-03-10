const User = require('../models/User');
const Machine = require('../models/Machine');

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
};

// Create a new user
const createUser = async (req, res) => {
    const { name, username, password, email } = req.body;
    
    console.log('Creating new user:', { name, username, password: password ? '***' : null, email });
    
    // Trim the password to prevent whitespace issues
    const trimmedPassword = password.trim();
    
    const newUser = new User({ 
        name, 
        username, 
        password: trimmedPassword, 
        email 
    });

    try {
        await newUser.save();
        console.log('User created successfully with ID:', newUser._id);
        res.status(201).send('User added successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send('Error adding user');
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body; // Optional: Check admin password if needed

    try {
        await User.findByIdAndDelete(id);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
};

// User login
const login = async (req, res) => {
    const { username, password } = req.body;
    
    console.log(`Login attempt: Username: '${username}', Password: '${password}'`);

    try {
        // First find the user by username only to verify they exist
        const userExists = await User.findOne({ username });
        console.log(`User exists: ${!!userExists}`);
        
        if (!userExists) {
            console.log('User not found with username:', username);
            return res.status(401).send('Invalid username or password');
        }
        
        console.log('Found user with username:', username);
        console.log('Stored password:', userExists.password);
        console.log('Submitted password:', password);
        
        // Try a case-insensitive password comparison to see if that's the issue
        // And trim any potential whitespace
        const storedPassword = userExists.password.trim();
        const providedPassword = password.trim();
        
        const exactMatch = storedPassword === providedPassword;
        const caseInsensitiveMatch = storedPassword.toLowerCase() === providedPassword.toLowerCase();
        
        console.log('Exact password match:', exactMatch);
        console.log('Case-insensitive password match:', caseInsensitiveMatch);
        
        // If the passwords don't match, try a case-insensitive match
        if (exactMatch || caseInsensitiveMatch) {
            console.log('Login successful for user:', username);
            
            // If we're using case-insensitive matching, update the password in DB to match
            // what the user provided for future logins
            if (!exactMatch && caseInsensitiveMatch) {
                console.log('Updating password case to match provided password');
                await User.findByIdAndUpdate(userExists._id, { password: providedPassword });
            }
            
            res.status(200).json({ message: 'Login successful', name: userExists.name });
        } else {
            console.log('Password mismatch for user:', username);
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
    }
};

// Admin login
const adminLogin = async (req, res) => {
    const { password } = req.body;
    
    // Verify admin password (same as used for other admin actions)
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'gkmicro@1234';
    
    if (password === ADMIN_PASSWORD) {
        res.status(200).json({ message: 'Admin login successful' });
    } else {
        res.status(401).send('Invalid admin password');
    }
};

// Reset user password
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { adminPassword, newPassword } = req.body;
    
    // Verify admin password (same as used for other admin actions)
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'gkmicro@1234';
    
    if (!adminPassword) {
        return res.status(400).send('Admin password is required');
    }
    
    if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).send('Incorrect admin password');
    }
    
    if (!newPassword || newPassword.length < 1) {
        return res.status(400).send('New password is required');
    }
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        // Update the user's password
        await User.findByIdAndUpdate(id, { password: newPassword });
        
        res.status(200).send('Password reset successfully');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password');
    }
};

module.exports = {
    getUsers,
    createUser,
    deleteUser,
    login,
    adminLogin,
    resetPassword
}; 