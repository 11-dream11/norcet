document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const landingLoginBtn = document.getElementById('landingLoginBtn');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const loginForm = document.getElementById('loginForm');
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
    
    // Current user
    let currentUser = JSON.parse(localStorage.getItem('currentNorcetUser')) || null;
    
    // Check if user is logged in
    if (currentUser) {
        updateUserDisplay();
        startAccessTimer();
    }
    
    // Event Listeners
    loginBtn.addEventListener('click', () => loginModal.show());
    landingLoginBtn.addEventListener('click', () => loginModal.show());
    logoutBtn.addEventListener('click', logout);
    
    loginForm.addEventListener('submit', handleLogin);
    
    // Functions
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Hardcoded credentials
        if (username === "user1234" && password === "789456123") {
            // Check if this is first login
            const firstLogin = localStorage.getItem('firstLoginDate') || new Date().toISOString();
            if (!localStorage.getItem('firstLoginDate')) {
                localStorage.setItem('firstLoginDate', firstLogin);
                // Set expiry 1 year from first login
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                localStorage.setItem('accessExpires', expiryDate.toISOString());
            }
            
            // Create user object
            currentUser = {
                name: "NORCET Student",
                email: "user1234",
                joinDate: firstLogin,
                lastLogin: new Date().toISOString(),
                firstLogin: firstLogin,
                accessExpires: localStorage.getItem('accessExpires')
            };
            
            // Save to localStorage
            localStorage.setItem('currentNorcetUser', JSON.stringify(currentUser));
            
            // Update UI
            loginModal.hide();
            updateUserDisplay();
            startAccessTimer();
            
            // Clear form
            loginForm.reset();
        } else {
            alert('Invalid credentials. Use username: user1234 and password: 789456123');
        }
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