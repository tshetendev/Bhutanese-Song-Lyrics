const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Define the song schema
const songSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    artist: { type: String, required: true },
    lyrics: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending'
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ownerName: { type: String, required: true },
    watchCount: { type: Number, default: 0 },
    albumPicture: { type: String, required: true }, // Base64 image string
});


// Middleware to ensure `_id` is assigned if not already present
songSchema.pre('save', function (next) {
    if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
    }
    next();
});

// Create the Song model
const Song = mongoose.model('Song', songSchema);

// Helper function to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
};

// Helper function to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
};

// Home Page - Display all songs (approved, pending, and rejected)
router.get('/all', async (req, res) => {
    try {
        const songs = await Song.find(); // Fetch all songs without filtering by status
        if (songs.length === 0) {
            return res.status(200).json({ message: 'No songs to display.' });
        }
        res.json(songs);
    } catch (error) {
        console.error('Error retrieving songs:', error);
        res.status(500).send('Error retrieving songs');
    }
});

// Home Page - Display approved songs only
router.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find({ status: 'approved' }); // Fetch only approved songs
        if (songs.length === 0) {
            return res.status(200).json({ message: 'No songs to display.' });
        }
        res.json(songs);
    } catch (error) {
        console.error('Error retrieving songs:', error);
        res.status(500).send('Error retrieving songs');
    }
});

// Add new song (Authenticated users only)
router.post('/add', isAuthenticated, async (req, res) => {
    const { title, artist, lyrics, dateReleased, albumPicture, mp3File } = req.body;

    const status = req.session.userType === 'admin' ? 'approved' : 'pending';

    const newSong = new Song({
        _id: new mongoose.Types.ObjectId(),
        title,
        artist,
        lyrics,
        status,
        ownerId: req.session.userId,
        ownerName: req.session.name,
        albumPicture,
    });

    try {
        await newSong.save();
        res.status(201).json({ message: 'Song submitted', song: newSong });
    } catch (error) {
        console.error('Error submitting song:', error);
        res.status(500).send('Error submitting song');
    }
});



// Admin routes (Only admins can approve/reject songs)
router.put('/approve/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (song && song.status === 'pending') {
            song.status = 'approved';
            await song.save();
            res.json({ message: 'Song approved and published', song });
        } else if (song && song.status === 'approved') {
            res.status(400).send('Song has already been approved');
        } else if (song && song.status === 'rejected') {
            res.status(400).send('Rejected song cannot be approved');
        } else {
            res.status(404).send('Song not found or already processed');
        }
    } catch (error) {
        res.status(400).send('Error approving song');
    }
});


// View Song (Approved only)
router.get('/song/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (song && song.status === 'approved') {
            // Increment the watch count
            song.watchCount += 1;
            await song.save(); // Save the updated song
            res.json(song);
        } else {
            res.status(404).send('Song not found or not approved');
        }
    } catch (error) {
        res.status(400).send('Invalid ID');
    }
});


// Edit Song (Owner or Admin only)
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    const songId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(songId)) {
        return res.status(400).send('Invalid ID format');
    }

    try {
        const song = await Song.findById(songId);
        if (song && (song.ownerId.toString() === req.session.userId || req.session.userType === 'admin')) {
            res.json(song);
        } else {
            res.status(404).send('Song not found or you do not have permission to edit this song');
        }
    } catch (error) {
        res.status(500).send('Error retrieving song');
    }
});

// Update Song (Owner or Admin only)
router.put('/edit/:id', isAuthenticated, async (req, res) => { // Change to PUT
    const { title, artist, lyrics, dateReleased, status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid ID format');
    }

    try {
        const song = await Song.findById(req.params.id);
        if (song && (song.ownerId.toString() === req.session.userId || req.session.userType === 'admin')) {
            const updatedSong = await Song.findByIdAndUpdate(
                req.params.id,
                { title, artist, lyrics, dateReleased: new Date(dateReleased), status },
                { new: true }
            );
            res.json(updatedSong);
        } else {
            res.status(404).send('Song not found or you do not have permission to update this song');
        }
    } catch (error) {
        res.status(400).send('Error updating song');
    }
});

// Delete Song (Admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Song.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).send('Error deleting song');
    }
});

// Admin - Reject Song
router.put('/reject/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (song && song.status === 'pending') {
            song.status = 'rejected';
            await song.save();
            res.json({ message: 'Song rejected', song });
        } else if (song && song.status === 'rejected') {
            res.status(400).send('Song has already been rejected');
        } else if (song && song.status === 'approved') {
            res.status(400).send('Approved song cannot be rejected');
        } else {
            res.status(404).send('Song not found or already processed');
        }
    } catch (error) {
        res.status(400).send('Error rejecting song');
    }
});

// Route to get all song titles for approved songs
router.get('/songTitles', async (req, res) => {
    try {
        // Find only the approved songs and project only the title field
        const titles = await Song.find({ status: 'approved' }, 'title');

        if (titles.length === 0) {
            return res.status(200).json({ message: 'No approved song titles to display.' });
        }

        res.json(titles);
    } catch (error) {
        console.error('Error retrieving song titles:', error);
        res.status(500).send('Error retrieving song titles');
    }
});

// Route to get the top 5 most-watched songs
router.get('/featured-songs', async (req, res) => {
    try {
        // Fetch the top 5 songs based on watchCount
        const featuredSongs = await Song.find({ status: 'approved' })
            .sort({ watchCount: -1 }) // Sort by watchCount in descending order
            .limit(5); // Limit the result to 5 songs

        if (featuredSongs.length === 0) {
            return res.status(200).json({ message: 'No featured songs available.' });
        }

        res.json(featuredSongs);
    } catch (error) {
        console.error('Error retrieving featured songs:', error);
        res.status(500).send('Error retrieving featured songs');
    }
});



module.exports = router;
