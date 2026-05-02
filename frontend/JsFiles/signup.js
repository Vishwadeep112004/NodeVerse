document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorMsg = document.getElementById('errorMsg');
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('span');

    // ==============================
    // Generate Random OTP
    // ==============================
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ==============================
    // Show Error Message
    // ==============================
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }

    // ==============================
    // Signup Form Submit
    // ==============================
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // ==============================
        // Basic Validation
        // ==============================
        if (!name || !surname || !username || !email || !password) {
            showError('All fields are required');
            return;
        }

        const userData = {
            name,
            surname,
            username,
            email,
            password,
            solved_problems: 0
        };

        try {
            btnText.textContent = 'Sending OTP...';
            signupBtn.disabled = true;

            // ==============================
            // Generate OTP
            // ==============================
            const generatedOTP = generateOTP();

            // ==============================
            // Save OTP + User Data
            // ==============================
            localStorage.setItem('signup_otp', generatedOTP);
            localStorage.setItem('signup_user', JSON.stringify(userData));

            // ==============================
            // Send OTP to Email
            // ==============================
            const response = await fetch('http://127.0.0.1:8000/api/send-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: generatedOTP
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('OTP sent successfully to your email.');
                window.location.href = './verify-otp.html';
            } else {
                let errText = data.message || 'Failed to send OTP.';
                showError(errText);
            }

        } catch (error) {
            console.error('Error during signup:', error);
            showError('Server error. Please make sure the Django backend is running on port 8000.');
        } finally {
            btnText.textContent = 'Register';
            signupBtn.disabled = false;
        }
    });
});
