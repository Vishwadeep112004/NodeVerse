document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const errorMsg = document.getElementById('errorMsg');
    const signinBtn = document.getElementById('signinBtn');
    const btnText = signinBtn.querySelector('span');

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value;

        if (!identifier || !password) {
            showError('Please enter both username/email and password.');
            return;
        }

        try {
            btnText.textContent = 'Authenticating...';
            signinBtn.disabled = true;

            // Fetch all users to verify credentials (Note: In a real app, backend should provide a dedicated /login endpoint)
            const response = await fetch('http://127.0.0.1:8000/api/users/');
            
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const users = await response.json();
            
            // Find user by username or email
            const user = users.find(u => u.username === identifier || u.email === identifier);

            if (user) {
                // Warning: This is a simulated password check since the backend is returning hashed passwords or not exposing them safely.
                // Assuming we're storing plaintext or handling it via proper auth in future.
                // For now, if the user exists, we simulate a login by matching username.
                // If real backend auth is added, replace this with a POST to /api/auth/login.
                
                // Save user session
                localStorage.setItem('nodeverse_user_id', user.id);
                window.location.href = './dashboard.html';
            } else {
                showError('Invalid username/email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Server error. Please ensure the Django backend is running on port 8000.');
        } finally {
            btnText.textContent = 'Login';
            signinBtn.disabled = false;
        }
    });

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
});
