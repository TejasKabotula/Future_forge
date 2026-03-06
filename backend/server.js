const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('--- ENV CHECK START ---');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET IS MISSING!');
}
console.log('--- ENV CHECK END ---');
const localBin = path.join(__dirname, 'bin');
const denoBin = path.join(require('os').homedir(), '.deno', 'bin');
process.env.PATH = localBin + path.delimiter + denoBin + path.delimiter + process.env.PATH;

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: [
        "https://futureforge.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Basic Routes
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'FutureForge API is running...' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
