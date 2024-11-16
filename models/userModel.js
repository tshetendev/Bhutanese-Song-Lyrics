const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema
const userSchema = new mongoose.Schema({
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
        enum: ['user', 'admin'], // Restrict userType to be either 'user' or 'admin'
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
        type: Buffer,
        required: false, // Making it optional
    },
}, {
    timestamps: true, // Automatically handle createdAt and updatedAt fields
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

module.exports = User;
