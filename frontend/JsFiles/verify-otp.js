
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('nodeverse_user_id');
    if (userId) {
        window.location.href = './Home.html';
        return;
    }

    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otpInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendBtn');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    const btnText = verifyBtn.querySelector('span');

    // ==============================
    // Show Error
    // ==============================
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
    }

    // ==============================
    // Show Success
    // ==============================
    function showSuccess(msg) {
        successMsg.textContent = msg;
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
    }

    // ==============================
    // Generate OTP
    // ==============================
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ==============================
    // Verify OTP
    // ==============================
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const enteredOTP = otpInput.value.trim();
        const storedOTP = localStorage.getItem('signup_otp');
        const userData = JSON.parse(localStorage.getItem('signup_user'));

        if (!enteredOTP) {
            showError('Please enter OTP.');
            return;
        }

        if (!storedOTP || !userData) {
            showError('Signup session expired. Please register again.');
            return;
        }

        if (enteredOTP !== storedOTP) {
            showError('Invalid OTP.');
            return;
        }

        try {
            btnText.textContent = 'Verifying...';
            verifyBtn.disabled = true;

            // ==============================
            // Final Account Creation
            // ==============================
            const response = await fetch('http://127.0.0.1:8000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('nodeverse_user_id', data.id);

                // Clear temporary signup data
                localStorage.removeItem('signup_otp');
                localStorage.removeItem('signup_user');

                showSuccess('Account verified successfully! Redirecting...');

                setTimeout(() => {
                    window.location.href = './Home.html';
                }, 1500);

            } else {
                let errText = 'Registration failed. ';
                if (data.email) errText += `Email: ${data.email[0]} `;
                if (data.username) errText += `Username: ${data.username[0]} `;
                showError(errText);
            }

        } catch (error) {
            console.error('OTP verification error:', error);
            showError('Server error. Please try again.');
        } finally {
            btnText.textContent = 'Verify OTP';
            verifyBtn.disabled = false;
        }
    });

    // ==============================
    // Resend OTP
    // ==============================
    resendBtn.addEventListener('click', async () => {
        const userData = JSON.parse(localStorage.getItem('signup_user'));

        if (!userData) {
            showError('Signup session expired. Please register again.');
            return;
        }

        try {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';

            const newOTP = generateOTP();

            localStorage.setItem('signup_otp', newOTP);

            const response = await fetch('http://127.0.0.1:8000/api/send-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    otp: newOTP
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess('New OTP sent successfully.');
            } else {
                showError(data.message || 'Failed to resend OTP.');
            }

        } catch (error) {
            console.error('Resend OTP error:', error);
            showError('Server error while resending OTP.');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    });
});
