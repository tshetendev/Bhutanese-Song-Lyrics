// server.js 

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const path = require('path');
const helmet = require('helmet'); // For security
const rateLimit = require('express-rate-limit'); // For rate limiting

const songRoutes = require('./routes/songsRoute.js');
const userRoutes = require('./routes/userRoute.js');

const app = express();

// Middleware

app.use(bodyParser.json({ limit: '50mb' })); // Set limit as per your needs (e.g., 50mb)
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Set secure cookies in production
}));

// Rate limiter for security
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security headers
app.use(helmet());

// Serve static files
app.use(express.static('public'));


// Routes
app.use(songRoutes);
app.use(userRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));


// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
