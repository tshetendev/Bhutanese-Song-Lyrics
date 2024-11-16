// auth.js 

// Open/close modals
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const closeBtns = document.querySelectorAll('.close');

loginBtn.onclick = function () {
    loginModal.style.display = 'block';
};

registerBtn.onclick = function () {
    registerModal.style.display = 'block';
};

closeBtns.forEach(btn => btn.onclick = function () {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
});

window.onclick = function (event) {
    if (event.target === loginModal || event.target === registerModal) {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
};

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerText = message;

    // Set alert type (success or error)
    if (type === 'success') {
        alertBox.classList.add('success');
    } else {
        alertBox.classList.remove('success');
    }

    alertBox.style.display = 'block';

    // Automatically hide alert after 3 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}

function showConfirmationModal(message, callback) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmBtn = document.getElementById('confirmBtn');

    confirmationMessage.innerText = message;
    confirmationModal.style.display = 'block';

    // Close the modal on 'Confirm' click
    confirmBtn.onclick = function () {
        confirmationModal.style.display = 'none';
        if (callback) callback();  // Call the callback if provided
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

// Close alert manually
document.querySelector('.close-alert').onclick = function () {
    document.getElementById('alertBox').style.display = 'none';
};

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log(result);
        if (response.ok) {
            // Check userType from the session property in the response
            if (result.session.userType === 'admin') {
                showConfirmationModal('Admin login successful! Click confirm to continue to the admin page.', function() {
                    window.location.href = '../admin/admin.html'; // Redirect to admin page
                });
            } else {
                showConfirmationModal('Login successful! Click confirm to continue to the homepage.', function() {
                    window.location.href = '../Home.html'; // Redirect to homepage
                });
            }
        } else {
            document.getElementById('loginError').innerText = result.message;
        }
    } catch (error) {
        showAlert('Error logging in', 'error');
    }
});



// Handle Register Form Submission
document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;
    const profilePictureFile = event.target.profilePicture.files[0];

    if (!profilePictureFile) {
        document.getElementById('registerError').innerText = 'Please upload a profile picture.';
        return;
    }

    // Convert profile picture to base64
    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64ProfilePicture = reader.result.split(',')[1]; // Extract the base64 string

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirmPassword,
                    profilePicture: base64ProfilePicture
                })
            });

            const result = await response.json();
            if (response.ok) {
                // Registration successful, show the confirmation modal
                showConfirmationModal('Registration successful! Click confirm to log in.', function () {
                    registerModal.style.display = 'none'; // Close registration modal
                    loginModal.style.display = 'block';   // Open login modal
                });
            } else {
                document.getElementById('registerError').innerText = result.message;
            }
        } catch (error) {
            showAlert('Error registering', 'error');
        }
    };

    reader.readAsDataURL(profilePictureFile); // Read the file as a base64 data URL
});



