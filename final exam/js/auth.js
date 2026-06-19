document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // --- SIGNUP LOGIC ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const role = document.getElementById('role').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');

            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            if (!name || !email || !role || !password || !confirmPassword) {
                errorDiv.innerText = 'All fields are required!';
                errorDiv.style.display = 'block';
                return;
            }

            if (password !== confirmPassword) {
                errorDiv.innerText = 'Passwords do not match!';
                errorDiv.style.display = 'block';
                return;
            }

            const users = Storage.getUsers();
            const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                errorDiv.innerText = 'Email already registered!';
                errorDiv.style.display = 'block';
                return;
            }

            const newUserId = 'u' + (users.length + 101);
            const newUser = { id: newUserId, name, email, password, role };

            Storage.saveUser(newUser);

            successDiv.innerText = 'Registration successful! Redirecting to login...';
            successDiv.style.display = 'block';
            signupForm.reset();

            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        });
    }

    // --- LOGIN LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');

            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            if (!email || !password) {
                errorDiv.innerText = 'Please enter both email and password.';
                errorDiv.style.display = 'block';
                return;
            }

            const users = Storage.getUsers();
            const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (!matchedUser) {
                errorDiv.innerText = 'Wrong email or password!';
                errorDiv.style.display = 'block';
                return;
            }

            const sessionUser = {
                id: matchedUser.id,
                name: matchedUser.name,
                email: matchedUser.email,
                role: matchedUser.role
            };
            Storage.setCurrentUser(sessionUser);

            successDiv.innerText = `Logged in successfully as ${matchedUser.role}!`;
            successDiv.style.display = 'block';

            setTimeout(() => {
                if (matchedUser.role === 'Admin') window.location.href = 'admin-dashboard.html';
                else if (matchedUser.role === 'Doctor') window.location.href = 'doctor-dashboard.html';
                else if (matchedUser.role === 'Receptionist') window.location.href = 'receptionist-dashboard.html';
            }, 1000);
        });
    }
});