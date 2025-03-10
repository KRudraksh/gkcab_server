const mongoose = require('mongoose');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || mongodb:'//gkcab-backend-server:CeCrtCyHGGoW4MAV0cVj3igoGGR2WI3ohsptJyeJ3NIpSbf8PMqqBJMWKZJsxUTphYdG6qpnt0cWACDbMTElrg==@gkcab-backend-server.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@gkcab-backend-server@';

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB }; 