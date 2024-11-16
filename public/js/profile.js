window.onload = async function() {
    try {
        const response = await fetch('/profile');
        const sessionData = await response.json();

        console.log('Session Data:', sessionData);  // Log session data to console

        if (response.ok) {
            // Use the fetched data from the response
            document.getElementById('userName').innerText = sessionData.name;
            document.getElementById('userEmail').innerText = sessionData.email;

            // Display profile picture if available
            const profilePicture = sessionData.profilePicture;
            if (profilePicture) {
                document.getElementById('profilePicture').src = `data:image/jpeg;base64,${profilePicture}`;
            } else {
                document.getElementById('profilePicture').src = 'default-profile.png'; // Fallback image
            }
        } else {
            console.error('Error fetching session data:', sessionData.message);
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
    }
};
