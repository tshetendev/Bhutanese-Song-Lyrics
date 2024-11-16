// song.js 


// Function to fetch and display song titles
async function fetchSongTitles() {
    try {
        const response = await fetch('/songTitles');
        const titles = await response.json();

        const songListContainer = document.getElementById('songList');
        songListContainer.innerHTML = ''; // Clear any previous content

        if (titles.length === 0) {
            songListContainer.innerHTML = '<p>No songs available.</p>';
            return;
        }

        titles.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-item-1'); // Add a class for styling

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

async function fetchSongs() {
    const loadingAnimation = document.getElementById('loading-animation');
    const songsContainer = document.getElementById('songs-container');

    try {
        // Show the loading animation
        loadingAnimation.classList.remove('hidden');

        const response = await fetch('/songs');
        const data = await response.json();

        // Clear the songs container in case of re-fetch
        songsContainer.innerHTML = '';

        if (data.message) {
            songsContainer.innerHTML = `<p>${data.message}</p>`;
        } else {
            data.forEach(song => {
                const songCard = document.createElement('div');
                songCard.classList.add('song-card');

                const albumImage = document.createElement('img');
                if (song.albumPicture) {
                    albumImage.src = `data:image/jpeg;base64,${song.albumPicture}`;
                } else {
                    albumImage.src = 'default-album-picture.jpg'; // default picture
                }
                albumImage.alt = `${song.title} - Album Picture`;
                albumImage.classList.add('album-picture');

                songCard.innerHTML = `
                    <div class="song-info">
                        <h2>${song.title}</h2>
                        <p><strong>Artist:</strong> ${song.artist}</p>
                        <p><strong>Posted on:</strong> ${new Date(song.datePosted).toDateString()}</p>
                        <button class="view-lyrics-btn" data-song-id="${song._id}">View Lyrics</button>
                    </div>
                `;

                songCard.prepend(albumImage);
                songsContainer.appendChild(songCard);
            });

            // Add click event to each "View Lyrics" button
            document.querySelectorAll('.view-lyrics-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const songId = this.dataset.songId;
                    handleViewLyrics(songId);
                });
            });
        }
    } catch (error) {
        console.error('Error fetching songs:', error);
        songsContainer.innerHTML = `<p>Error loading songs. Please try again later.</p>`;
    } finally {
        // Hide the loading animation
        loadingAnimation.classList.add('hidden');
    }
}

// Function to handle clicking on "View Lyrics" button
function handleViewLyrics(songId) {
    window.location.href = `./songDetails.html?songId=${songId}`;
}


// Fetch and display songs when the page loads
window.onload = fetchSongs;
