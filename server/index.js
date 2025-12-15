const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');

console.log("Starting Server...");
console.log("MONGO_URI Loaded:", process.env.MONGO_URI ? "YES" : "NO");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/classrooms', require('./routes/classroomRoutes'));

app.get('/', (req, res) => res.send('API Running'));

const PORT = 5001; // Hardcode port for stability
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Connect to DB asynchronously (fire and forget / log error)
    connectDB().catch(err => console.error("Async DB Connection Failed:", err.message));
});
