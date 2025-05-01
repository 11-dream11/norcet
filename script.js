document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const landingLoginBtn = document.getElementById('landingLoginBtn');
    const landingRegisterBtn = document.getElementById('landingRegisterBtn');
    const showRegister = document.getElementById('showRegister');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const mainContent = document.getElementById('mainContent');
    const landingContent = document.getElementById('landingContent');
    const userGreeting = document.getElementById('userGreeting');
    const accessTimer = document.getElementById('accessTimer');
    const expiryDate = document.getElementById('expiryDate');
    const expiryDateSidebar = document.getElementById('expiryDateSidebar');
    const countdownTimer = document.getElementById('countdownTimer');
    const accessProgress = document.getElementById('accessProgress');
    const joinDate = document.getElementById('joinDate');
    const lastLogin = document.getElementById('lastLogin');
    
    // Sample user data (in a real app, this would come from a server/database)
    let users = JSON.parse(localStorage.getItem('norcetUsers')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentNorcetUser')) || null;
    
    // Check if user is logged in
    if (currentUser) {
        updateUserDisplay();
        startAccessTimer();
    }
    
    // Event Listeners
    loginBtn.addEventListener('click', () => loginModal.show());
    landingLoginBtn.addEventListener('click', () => loginModal.show());
    landingRegisterBtn.addEventListener('click', () => registerModal.show());
    logoutBtn.addEventListener('click', logout);
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.hide();
        registerModal.show();
    });
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Functions
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Update last login and set access expiry if this is first login
            if (!user.firstLogin) {
                user.firstLogin = new Date().toISOString();
                user.accessExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            } else if (!user.accessExpires) {
                // For existing users who didn't have expiry set
                user.accessExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            }
            
            user.lastLogin = new Date().toISOString();
            currentUser = user;
            
            // Save to localStorage
            localStorage.setItem('currentNorcetUser', JSON.stringify(currentUser));
            localStorage.setItem('norcetUsers', JSON.stringify(users));
            
            // Update UI
            loginModal.hide();
            updateUserDisplay();
            startAccessTimer();
            
            // Clear form
            loginForm.reset();
        } else {
            alert('Invalid email or password');
        }
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Simple validation
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        // Create new user (accessExpires will be set on first login)
        const newUser = {
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            lastLogin: null,
            firstLogin: null,
            accessExpires: null
        };
        
        users.push(newUser);
        localStorage.setItem('norcetUsers', JSON.stringify(users));
        
        alert('Registration successful! Please login.');
        registerModal.hide();
        loginModal.show();
        registerForm.reset();
    }
    
    function logout() {
        currentUser = null;
        localStorage.removeItem('currentNorcetUser');
        
        // Update UI
        mainContent.classList.add('d-none');
        landingContent.classList.remove('d-none');
        loginBtn.classList.remove('d-none');
        logoutBtn.classList.add('d-none');
        userGreeting.textContent = '';
        accessTimer.textContent = '';
    }
    
    function updateUserDisplay() {
        if (!currentUser) return;
        
        // Show/hide appropriate sections
        mainContent.classList.remove('d-none');
        landingContent.classList.add('d-none');
        loginBtn.classList.add('d-none');
        logoutBtn.classList.remove('d-none');
        
        // Set user info
        userGreeting.textContent = `Hello, ${currentUser.name}`;
        
        const joinDateObj = new Date(currentUser.joinDate);
        joinDate.textContent = joinDateObj.toLocaleDateString();
        
        if (currentUser.lastLogin) {
            const lastLoginObj = new Date(currentUser.lastLogin);
            lastLogin.textContent = lastLoginObj.toLocaleString();
        }
    }
    
    function startAccessTimer() {
        if (!currentUser || !currentUser.accessExpires) return;
        
        const expiryDateObj = new Date(currentUser.accessExpires);
        const expiryDateStr = expiryDateObj.toLocaleDateString();
        
        expiryDate.textContent = expiryDateStr;
        expiryDateSidebar.textContent = expiryDateStr;
        
        // Update countdown every second
        const timerInterval = setInterval(() => {
            const now = new Date();
            const timeLeft = expiryDateObj - now;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                countdownTimer.textContent = 'Access expired!';
                accessProgress.style.width = '0%';
                return;
            }
            
            // Calculate days, hours, minutes, seconds
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            // Display countdown
            countdownTimer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            
            // Calculate percentage of time remaining (1 year = 365 days)
            const totalAccessTime = 365 * 24 * 60 * 60 * 1000;
            const timeUsed = totalAccessTime - timeLeft;
            const percentageUsed = (timeUsed / totalAccessTime) * 100;
            const percentageRemaining = 100 - percentageUsed;
            
            // Update progress bar
            accessProgress.style.width = `${percentageRemaining}%`;
            
            // Change color based on remaining time
            if (percentageRemaining < 10) {
                accessProgress.classList.remove('bg-warning');
                accessProgress.classList.add('bg-danger');
            } else if (percentageRemaining < 30) {
                accessProgress.classList.remove('bg-success');
                accessProgress.classList.add('bg-warning');
            } else {
                accessProgress.classList.remove('bg-warning', 'bg-danger');
                accessProgress.classList.add('bg-success');
            }
            
            // Update navbar timer
            const daysOnly = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            accessTimer.textContent = `${daysOnly} days left`;
        }, 1000);
    }
});