document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab'); // Select all tab elements
    const contentSections = document.querySelectorAll('.content-section'); // Select all content sections

    const STORAGE_KEYS = {
        USER: 'user',
        OTP: 'otp'
    };

    // Auth State
    let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    let currentOTP = '';

    // Update UI based on auth state
    function updateAuthUI() {
        const loginBtn = document.querySelector('.login-btn .material-icons');
        if (currentUser) {
            loginBtn.textContent = 'account_circle';
            loginBtn.style.color = 'var(--primary-color)';
        } else {
            loginBtn.textContent = 'account_circle';
            loginBtn.style.color = '';
        }
    }

    // Generate OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Social Login Handlers
    document.getElementById('google-login')?.addEventListener('click', () => {
        // Simulate Google login
        const user = {
            id: 'google_' + Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            provider: 'google'
        };
        handleLoginSuccess(user);
    });

    document.getElementById('github-login')?.addEventListener('click', () => {
        // Simulate GitHub login
        const user = {
            id: 'github_' + Date.now(),
            name: 'GitHub User',
            email: 'user@github.com',
            provider: 'github'
        };
        handleLoginSuccess(user);
    });

    // Handle successful login
    function handleLoginSuccess(user) {
        currentUser = user;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        updateAuthUI();
        hideAllModals();
    }

    // Handle logout
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.USER);
        updateAuthUI();
    }

    // Forgot Password Form Handler
    const forgotPasswordForm = document.querySelector('#forgot-password-modal .login-form');
    forgotPasswordForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        
        // Generate and store OTP
        currentOTP = generateOTP();
        localStorage.setItem(STORAGE_KEYS.OTP, currentOTP);
        
        // Show OTP Modal
        hideAllModals();
        const otpModal = document.getElementById('otp-modal');
        otpModal.classList.add('active');
        
        // Focus first OTP input
        const firstOtpInput = otpModal.querySelector('.otp-input');
        firstOtpInput?.focus();
        
        // Send OTP via email
        fetch('http://localhost:3001/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: currentOTP
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Preview URL:', data.previewUrl);
                alert('OTP has been sent to your email. Please check your inbox.');
            } else {
                alert('Failed to send OTP. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send OTP. Please try again.');
        });
    });

    // OTP Input Handlers
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // OTP Form Handler
    const otpForm = document.getElementById('otp-form');
    otpForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
        const storedOTP = localStorage.getItem(STORAGE_KEYS.OTP);
        
        if (enteredOTP === storedOTP) {
            // Clear OTP from storage
            localStorage.removeItem(STORAGE_KEYS.OTP);
            
            // Show success message and redirect to login
            alert('Password reset link has been sent to your email.');
            hideAllModals();
            const loginModal = document.getElementById('login-modal');
            loginModal.classList.add('active');
        } else {
            alert('Invalid OTP. Please try again.');
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    });

    // Resend OTP Handler
    document.getElementById('resend-otp')?.addEventListener('click', () => {
        const email = document.getElementById('reset-email').value;
        currentOTP = generateOTP();
        localStorage.setItem(STORAGE_KEYS.OTP, currentOTP);
        
        // Send new OTP via email
        fetch('http://localhost:3001/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: currentOTP
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Preview URL:', data.previewUrl);
                alert('New OTP has been sent to your email. Please check your inbox.');
            } else {
                alert('Failed to send OTP. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send OTP. Please try again.');
        });
    });

    // Regular Login Form Handler
    const loginForm = document.querySelector('#login-modal .login-form');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Simulate login validation
        const user = {
            id: 'email_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            provider: 'email'
        };
        handleLoginSuccess(user);
    });

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        console.log('Login button found, adding event listener.');
        loginBtn.addEventListener('click', (e) => {
            if (currentUser) {
                e.preventDefault();
                const dropdown = document.createElement('div');
                dropdown.className = 'login-dropdown';
                dropdown.innerHTML = `
                    <div class="dropdown-header">
                        <span class="material-icons">account_circle</span>
                        <div>
                            <div class="user-name">${currentUser.name}</div>
                            <div class="user-email">${currentUser.email}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" id="logout-btn">
                        <span class="material-icons">logout</span>
                        Sign Out
                    </button>
                `;
                
                // Position the dropdown
                dropdown.style.position = 'absolute';
                dropdown.style.top = '100%';
                dropdown.style.right = '0';
                
                // Remove existing dropdown if any
                document.querySelector('.login-dropdown')?.remove();
                
                // Add new dropdown
                loginBtn.parentElement.appendChild(dropdown);
                
                // Add logout handler
                document.getElementById('logout-btn')?.addEventListener('click', () => {
                    handleLogout();
                    dropdown.remove();
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && !loginBtn.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            } else {
                // Show login modal if not logged in
                hideAllModals();
                const loginModal = document.getElementById('login-modal');
                loginModal.classList.add('active');
            }
        });
    }

    // Hide all modals
    function hideAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        overlay.style.display = 'none'; // Hide the overlay
        document.body.style.overflow = ''; // Reset body overflow
    }

    updateAuthUI();

    const navbarSearch = document.querySelector('.navbar-search');
    const navbarSearchInput = navbarSearch?.querySelector('input');
    const navbarSearchBtn = navbarSearch?.querySelector('.navbar-search-btn');

    if (navbarSearch && navbarSearchInput && navbarSearchBtn) {
        console.log('Navbar search elements found, adding event listeners.');
        // Handle search button click
        navbarSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSearch();
        });

        // Handle Enter key press
        navbarSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });

        function handleSearch() {
            const query = navbarSearchInput.value.trim();
            if (query) {
                // Switch to search section
                showSection('search');
                
                // Set the value in the main search input
                const mainSearchInput = document.querySelector('#search-section .search-input');
                if (mainSearchInput) {
                    mainSearchInput.value = query;
                }
                
                // Clear the navbar search
                navbarSearchInput.value = '';
                
                // Focus the main search input
                mainSearchInput?.focus();
            }
        }
    }

    const menuBtn = document.querySelector('.menu-btn');
    const menuModal = document.getElementById('menu-modal');

    if (menuBtn && menuModal) {
        console.log('Menu button found, adding event listener.');
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllModals();
            menuModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Modal navigation buttons (Sign Up, Forgot Password)
    document.querySelectorAll('.link-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            if (modalId) {
                hideAllModals();
                const targetModal = document.getElementById(modalId);
                if (targetModal) {
                    targetModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    // Menu item click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionId = item.getAttribute('data-section');
            const modalId = item.getAttribute('data-modal');
            const href = item.getAttribute('href');

            if (sectionId) {
                e.preventDefault();
                showSection(sectionId);
                hideAllModals();
            } else if (modalId) {
                e.preventDefault();
                hideAllModals();
                const targetModal = document.getElementById(modalId);
                if (targetModal) {
                    targetModal.classList.add('active');
                }
            }
        });
    });

    const modalCloseButtons = document.querySelectorAll('.modal .modal-close'); // Select all modal close buttons

    // Modal close buttons
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('.modal');
            if (modal) {
                hideAllModals();
            }
        });
    });

    const overlay = document.querySelector('.overlay'); // Select the overlay element

const teamSection = document.getElementById('team'); // Define teamSection variable

    // Team section functionality
    function hideTeam() {
        if (teamSection) {
            window.location.hash = '';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Add click event listener to team link in menu
    const teamLink = document.getElementById('team-link');
    if (teamLink) {
        teamLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllModals();
            window.location.hash = 'team';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Handle team section close button
    const closeTeamBtn = document.querySelector('.close-team');
    if (closeTeamBtn) {
        closeTeamBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideTeam();
        });
    }

    // Handle overlay clicks
    if (overlay) {
        overlay.addEventListener('click', () => {
            hideAllModals();
            if (window.location.hash === '#team') {
                hideTeam();
            }
        });
    }

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllModals();
            if (window.location.hash === '#team') {
                hideTeam();
            }
        }
    });

    // Handle hash change for team section
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#team') {
            hideAllModals();
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });

    // Section functionality
    function showSection(sectionId) {
        hideAllModals();
        tabs.forEach(tab => tab.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        const selectedTab = document.querySelector(`.tab[data-section="${sectionId}"]`);
        const selectedSection = document.getElementById(`${sectionId}-section`);
        
        if (selectedTab && selectedSection) {
            selectedTab.classList.add('active');
            selectedSection.classList.add('active');
        }
    }

    // Initialize with default section
    showSection('file');
});
