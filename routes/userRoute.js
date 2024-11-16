const express = require('express');
// const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return new mongoose.Types.ObjectId();
        }
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)+@\w+([.-]?\w+)+(\.\w{2,3})+$/,
            'Please enter a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
    },
    userType: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
        type: Buffer,
        required: false,
    },
}, {
    timestamps: true,
    profilePicture: { type: String, required: true },
});


// Encrypt password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, userType, profilePicture } = req.body;  // Add userType

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create and save user
        const newUser = new User({
            name,
            email,
            password,
            userType, // Set userType here
            profilePicture,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Convert profilePicture buffer to base64
        const profilePictureBase64 = user.profilePicture
            ? user.profilePicture.toString('base64')
            : null;

        // Store session data, including base64 profile picture
        req.session.userId = user._id;
        req.session.userType = user.userType;
        req.session.email = user.email;
        req.session.name = user.name;
        req.session.profilePicture = profilePictureBase64;  // Store as base64

        // Send session data in the response
        return res.json({
            message: 'Login successful',
            session: {
                userId: req.session.userId,
                userType: req.session.userType,
                email: req.session.email,
                name: req.session.name,
                profilePicture: req.session.profilePicture,  // Now it's base64
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging in' });
    }
});




// Logout User and destroy session
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: 'Logout successful' });
    });
});


// Profile Route (Authenticated users only)
router.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized, please log in.' });
    }

    // Return the session data with base64-encoded profile picture
    return res.json({
        userId: req.session.userId,
        userType: req.session.userType,
        email: req.session.email,
        name: req.session.name,
        profilePicture: req.session.profilePicture,
    });
});


module.exports = router;
