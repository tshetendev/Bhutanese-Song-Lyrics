const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    artist: { type: String, required: true },
    lyrics: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },  // Automatically set to the current date
    dateReleased: { type: Date, required: true }    // Must be provided when adding a song
});

// Middleware to ensure `_id` is assigned if not already present
songSchema.pre('save', function(next) {
    if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
    }
    next();
});

module.exports = mongoose.model('Song', songSchema);
