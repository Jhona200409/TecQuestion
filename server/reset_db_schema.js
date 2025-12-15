require('dotenv').config();
const mongoose = require('mongoose');

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        try {
            await mongoose.connection.collection('classrooms').drop();
            console.log('Classrooms collection dropped to fix schema mismatch');
        } catch (e) {
            console.log('Collection might not exist, skipping drop', e.message);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

reset();
