const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Check if admin exists
        const adminEmail = 'admin@tecquestion.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists.');
            process.exit();
        }

        console.log('Creating Admin User...');
        const admin = await User.create({
            name: 'Profesor Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'teacher'
        });

        console.log('Admin user created successfully:', admin);
        console.log('You can now login with:');
        console.log('Email: admin@tecquestion.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAdmin();
