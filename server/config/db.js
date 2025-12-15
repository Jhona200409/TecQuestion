const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in env');
        }
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Do not exit process in dev to allow nodemon to restart safely if config changes
        // process.exit(1); 
        throw error; // Re-throw to be caught by index.js
    }
};

module.exports = connectDB;
