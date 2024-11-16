// songDetails.js 

// Function to extract query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


async function fetchSongDetails() {
    const songId = getQueryParam('songId');

    const loadingContainer = document.getElementById('loadingContainer');
    const songTitle = document.getElementById('songTitle');
    const songLyrics = document.getElementById('songLyrics');
    const albumImage = document.getElementById('albumPicture');
    const songDetails = document.getElementById('songDetails');

    // Show loading animation and hide content initially
    loadingContainer.style.display = 'flex';
    songDetails.style.opacity = '0.5';  // Optional dimming effect

    if (!songId) {
        loadingContainer.innerHTML = '<p>Song not found. No song ID provided in the URL.</p>';
        return;
    }

    try {
        const response = await fetch(`/song/${songId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const song = await response.json();

        if (song) {
            // Hide loading animation and show song details
            loadingContainer.style.display = 'none';
            songDetails.style.opacity = '1';  // Restore full opacity

            // Update HTML elements with song details
            songTitle.textContent = song.title;
            document.getElementById('songArtist').textContent = `Artist: ${song.artist}`;
            songLyrics.innerHTML = `
                <div class="lyrics-main">
                    <h3>Song Lyrics</h3> 
                    <p>${song.lyrics}</p>
                </div>`;
            document.getElementById('songDatePosted').textContent = `Posted on: ${new Date(song.datePosted).toLocaleDateString()}`;

            // Display album picture
            albumImage.src = `data:image/jpeg;base64,${song.albumPicture}`;
            albumImage.alt = `${song.title} - Album Picture`;
            albumImage.style.display = 'inline-block';

            // Display additional song info
            document.getElementById('songStatus').textContent = `Status: ${song.status}`;
            document.getElementById('songOwner').textContent = `Posted by: ${song.ownerName}`;
            document.getElementById('songViews').textContent = `Song Views: ${song.watchCount}`;
        }
    } catch (error) {
        console.error('Error fetching song details:', error);
        loadingContainer.innerHTML = '<p>Error loading song details.</p>';
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchSongDetails);



// Function to fetch and display song titles
async function fetchSongTitles() {
    try {
        const response = await fetch('/songTitles');
        const titles = await response.json();

        const songListContainer = document.getElementById('song-title-list');
        songListContainer.innerHTML = ''; // Clear any previous content

        if (titles.length === 0) {
            songListContainer.innerHTML = '<p>No songs available.</p>';
            return;
        }

        titles.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item'); // Add a class for styling

            // Create a clickable link for each song
            songElement.innerHTML = `
                <span class="song-link" style="cursor: pointer;">${song.title}</span>
            `;

            // Add event listener to handle redirection to songsDetails.html
            songElement.addEventListener('click', () => {
                window.location.href = `./songDetails.html?songId=${song._id}`; // Redirect to details page with song ID as query parameter
            });

            songListContainer.appendChild(songElement);
        });
    } catch (error) {
        console.error('Error fetching song titles:', error);
        document.getElementById('songList').innerHTML = '<p>Error loading songs.</p>';
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchSongTitles);


// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchSongDetails);
