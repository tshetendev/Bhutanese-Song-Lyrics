document.getElementById('songForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const form = event.target;
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const lyrics = document.getElementById('lyrics').value;
    const dateReleased = document.getElementById('dateReleased').value;
    const albumPictureInput = document.getElementById('albumPicture');
    const mp3FileInput = document.getElementById('mp3File');
    const messageDiv = document.getElementById('message');

    const albumPictureFile = albumPictureInput.files[0];
    const mp3File = mp3FileInput.files[0];

    if (!albumPictureFile || !mp3File) {
        messageDiv.innerHTML = '<p>Please upload both an album picture and an MP3 file.</p>';
        return;
    }

    // Function to convert file to Base64
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove metadata
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    try {
        // Convert both files to Base64
        const base64Image = await toBase64(albumPictureFile);
        const base64Mp3 = await toBase64(mp3File);

        const songData = {
            title,
            artist,
            lyrics,
            albumPicture: base64Image, // Base64 encoded album picture
            mp3File: base64Mp3 // Base64 encoded MP3 file
        };

        // Make the POST request to submit the song
        const response = await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(songData)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<p>Song added successfully!</p>';
            form.reset(); // Clear the form
        } else {
            messageDiv.innerHTML = `<p>Error: ${result.message}</p>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<p>Failed to submit song: ${error.message}</p>`;
    }
});
