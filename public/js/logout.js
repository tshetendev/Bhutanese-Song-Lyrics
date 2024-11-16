document.getElementById('logoutLink').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior
    showConfirmationModal('Are you sure you want to log out?', handleLogout);
});

function showConfirmationModal(message, callback) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    confirmationMessage.innerText = message;

    confirmationModal.style.display = 'block';

    // Handle confirm logout
    document.getElementById('confirmLogout').onclick = function () {
        confirmationModal.style.display = 'none'; // Hide the modal
        if (callback) callback();  // Call the callback to handle logout
    };

    // Handle cancel logout
    document.getElementById('cancelLogout').onclick = function () {
        confirmationModal.style.display = 'none'; // Just close the modal
    };

    // Close modal if 'X' is clicked
    document.querySelector('.close-confirmation').onclick = function () {
        confirmationModal.style.display = 'none';
    };

    // Close modal if clicking outside of the modal
    window.onclick = function (event) {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    };
}

// Function to handle actual logout
function handleLogout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Show success message in confirmation modal
            showConfirmationModal('Logout successful! Click OK to return to the homepage.', function() {
                window.location.href = '/'; // Redirect to homepage after user acknowledges
            });
        } else {
            return response.json().then(data => {
                // Show error message in confirmation modal
                showConfirmationModal(data.message || 'Error logging out. Please try again.', function() {
                    // Optionally, you can add any action after an error here
                });
            });
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        // Show error message in confirmation modal
        showConfirmationModal('Error logging out. Please try again.', function() {
            // Optionally, you can add any action after an error here
        });
    });
}
