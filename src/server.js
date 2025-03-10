require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB } = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const machineRoutes = require('./routes/machineRoutes');
const operationRoutes = require('./routes/operationRoutes');
const esp32Routes = require('./routes/esp32Routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Track last data update time (global variable)
global.lastDataUpdateTime = new Date().toISOString();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api', esp32Routes);

// Simple route for checking if server is running
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Last update time endpoint
app.get('/api/lastUpdate', (req, res) => {
  res.json({ lastUpdateTime: global.lastDataUpdateTime });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../public')));

  // Any route that is not an API route should be handled by React
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 