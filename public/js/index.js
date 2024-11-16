// Function to fetch and display featured songs
async function fetchFeaturedSongs() {
    const loader = document.getElementById('loader');
    const featuredSongsContainer = document.getElementById('featuredSongs');
    
    // Show loader before fetching
    loader.style.display = 'block';
    featuredSongsContainer.style.display = 'none';

    try {
        const response = await fetch('/featured-songs');
        const songs = await response.json();

        featuredSongsContainer.innerHTML = ''; // Clear any previous content

        if (songs.length === 0) {
            featuredSongsContainer.innerHTML = '<p>No featured songs available.</p>';
        } else {
            songs.forEach(song => {
                const songElement = document.createElement('div');
                songElement.classList.add('song-item'); // Add a class for styling

                // Format the datePosted and dateReleased
                const formattedDatePosted = new Date(song.datePosted).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                const formattedDateReleased = new Date(song.dateReleased).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                songElement.innerHTML = `
                    <div class="image-container" data-song-id="${song._id}">
                        <img src="data:image/jpeg;base64,${song.albumPicture}" alt="${song.title} - Album Picture" />
                        <div class="song-details">
                            <h3>${song.title}</h3>
                            <p>Watch Count: ${song.watchCount}</p>
                            <p>Posted by: ${song.ownerName}</p>
                            <p>Posted on: ${formattedDatePosted}</p>
                            <button class="view-lyrics-btn" data-song-id="${song._id}">View Lyrics</button>
                        </div>
                    </div>
                    <div class="detailsong">
                        <p class="left">Artist: ${song.artist}</p>
                        <p class="right">Date Released: ${formattedDateReleased}</p>
                    </div>
                `;
                featuredSongsContainer.appendChild(songElement);
            });

            // Add click event to each "View Lyrics" button
            document.querySelectorAll('.view-lyrics-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const songId = this.dataset.songId;
                    handleViewLyrics(songId);
                });
            });
        }

    } catch (error) {
        console.error('Error fetching featured songs:', error);
        featuredSongsContainer.innerHTML = '<p>Error loading featured songs.</p>';
    } finally {
        // Hide loader and show content after fetching
        loader.style.display = 'none';
        featuredSongsContainer.style.display = 'inline-flex';
    }
}


// Function to handle clicking on "View Lyrics" button
function handleViewLyrics(songId) {
    window.location.href = `./songDetails.html?songId=${songId}`;
}

// Functions for scrolling the slider
function scrollLeft() {
    const container = document.getElementById('featuredSongs');
    container.scrollBy({
        left: -container.clientWidth * 0.75,
        behavior: 'smooth'
    });
}

function scrollRight() {
    const container = document.getElementById('featuredSongs');
    container.scrollBy({
        left: container.clientWidth * 0.75,
        behavior: 'smooth'
    });
}

// Bind scroll events to buttons
document.getElementById('leftArrow').addEventListener('click', scrollLeft);
document.getElementById('rightArrow').addEventListener('click', scrollRight);

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchFeaturedSongs);
