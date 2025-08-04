// script.js
document.addEventListener('DOMContentLoaded', function() {
    // User authentication state
    let currentUser = null;
    let userProgress = {
        completedExams: 0,
        averageScore: 0,
        studyHours: 0,
        subjects: {
            'crop-science': 0,
            'soil-science': 0,
            'crop-protection': 0,
            'animal-science': 0,
            'agricultural-economics': 0,
            'agricultural-extension': 0
        }
    };

    // DOM Elements
    const loginModal = document.getElementById('login-modal');
    const dashboardModal = document.getElementById('dashboard-modal');
    const examModal = document.getElementById('exam-modal');
    const authButton = document.getElementById('auth-button');
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    
    // Auth elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    const closeButtons = document.querySelectorAll('.close');
    
    // Dashboard elements
    const userNameSpan = document.getElementById('user-name');
    const completedExamsSpan = document.getElementById('completed-exams');
    const averageScoreSpan = document.getElementById('average-score');
    const studyHoursSpan = document.getElementById('study-hours');
    
    // Progress elements
    const progressElements = {
        'crop-science': {
            progress: document.getElementById('crop-progress'),
            fill: document.getElementById('crop-fill')
        },
        'soil-science': {
            progress: document.getElementById('soil-progress'),
            fill: document.getElementById('soil-fill')
        },
        'crop-protection': {
            progress: document.getElementById('protection-progress'),
            fill: document.getElementById('protection-fill')
        },
        'animal-science': {
            progress: document.getElementById('animal-progress'),
            fill: document.getElementById('animal-fill')
        },
        'agricultural-economics': {
            progress: document.getElementById('economics-progress'),
            fill: document.getElementById('economics-fill')
        },
        'agricultural-extension': {
            progress: document.getElementById('extension-progress'),
            fill: document.getElementById('extension-fill')
        }
    };

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Authentication functionality
    authButton.addEventListener('click', function() {
        if (currentUser) {
            dashboardModal.style.display = 'block';
            updateDashboard();
        } else {
            loginModal.style.display = 'block';
        }
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            dashboardModal.style.display = 'none';
            examModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === dashboardModal) {
            dashboardModal.style.display = 'none';
        }
        if (event.target === examModal) {
            examModal.style.display = 'none';
            resetExam();
        }
    });

    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.getAttribute('data-tab');
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('signup-form').classList.remove('active');
            document.getElementById(tabName + '-form').classList.add('active');
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // In a real application, this would validate against a database
        // For demo purposes, we'll accept any non-empty email and password
        if (email && password) {
            currentUser = {
                email: email,
                name: email.split('@')[0]
            };
            loginModal.style.display = 'none';
            updateAuthButton();
            dashboardModal.style.display = 'block';
            updateDashboard();
        } else {
            alert('Please enter both email and password');
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real application, this would create a user in the database
        currentUser = {
            email: email,
            name: name
        };
        
        // Initialize user progress
        userProgress = {
            completedExams: 0,
            averageScore: 0,
            studyHours: 0,
            subjects: {
                'crop-science': 0,
                'soil-science': 0,
                'crop-protection': 0,
                'animal-science': 0,
                'agricultural-economics': 0,
                'agricultural-extension': 0
            }
        };
        
        loginModal.style.display = 'none';
        updateAuthButton();
        dashboardModal.style.display = 'block';
        updateDashboard();
    });

    // Subject cards
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach(card => {
        card.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            if (!currentUser) {
                loginModal.style.display = 'block';
                return;
            }
            alert(`Opening review materials for ${formatSubjectName(subject)}\n\nThis feature will display detailed review content for the selected subject area.`);
        });
    });

    // Mock exam cards
    const examCards = document.querySelectorAll('.exam-card');
    examCards.forEach(card => {
        card.addEventListener('click', function() {
            const exam = this.getAttribute('data-exam');
            if (!currentUser) {
                loginModal.style.display = 'block';
                return;
            }
            document.getElementById('exam-title').textContent = `${formatSubjectName(exam)} Mock Exam`;
            examModal.style.display = 'block';
            loadExamQuestions(exam);
            startTimer();
        });
    });

    // Dashboard actions
    document.getElementById('continue-studying').addEventListener('click', function() {
        dashboardModal.style.display = 'none';
        window.scrollTo({
            top: document.getElementById('review-materials').offsetTop - 80,
            behavior: 'smooth'
        });
    });

    document.getElementById('view-results').addEventListener('click', function() {
        dashboardModal.style.display = 'none';
        window.scrollTo({
            top: document.getElementById('mock-exams').offsetTop - 80,
            behavior: 'smooth'
        });
    });

    // Start review button
    document.getElementById('start-review-btn').addEventListener('click', function() {
        if (!currentUser) {
            loginModal.style.display = 'block';
            return;
        }
        window.scrollTo({
            top: document.getElementById('review-materials').offsetTop - 80,
            behavior: 'smooth'
        });
    });

    // Exam navigation
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    const currentQuestionSpan = document.getElementById('current-question');
    
    let currentQuestionIndex = 0;
    const totalQuestions = 100;
    
    function updateQuestionDisplay() {
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
    }
    
    prevButton.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestionDisplay();
        }
    });
    
    nextButton.addEventListener('click', function() {
        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
            updateQuestionDisplay();
        }
    });
    
    // Submit exam
    document.getElementById('submit-exam').addEventListener('click', function() {
        if (confirm('Are you sure you want to submit your exam?')) {
            // Generate random score for demo
            const score = Math.floor(Math.random() * 40) + 60; // 60-99%
            const examType = document.getElementById('exam-title').textContent.replace(' Mock Exam', '').toLowerCase().replace(' ', '-');
            
            // Update user progress
            userProgress.completedExams++;
            userProgress.averageScore = Math.round(
                (userProgress.averageScore * (userProgress.completedExams - 1) + score) / userProgress.completedExams
            );
            userProgress.studyHours += 2; // 2 hours per exam
            userProgress.subjects[examType] = Math.min(100, userProgress.subjects[examType] + 20);
            
            alert(`Exam submitted!\n\nYour score: ${score}%\n\nIn a real implementation, this would save your results and provide detailed feedback on your performance.`);
            
            examModal.style.display = 'none';
            resetExam();
            
            // Update dashboard if it's open
            if (dashboardModal.style.display === 'block') {
                updateDashboard();
            }
        }
    });

    // Functions
    function formatSubjectName(subject) {
        return subject.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    function loadExamQuestions(subject) {
        const examQuestions = document.getElementById('exam-questions');
        examQuestions.innerHTML = '';
        
        for (let i = 0; i < 10; i++) { // Only showing 10 for demo
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            questionContainer.innerHTML = `
                <div class="question-text">Question ${i + 1}: This is a sample question for ${formatSubjectName(subject)}. In a real implementation, this would be an actual exam question related to the subject area.</div>
                <div class="options-container">
                    <div class="option">A) Option A - This would be a possible answer choice</div>
                    <div class="option">B) Option B - This would be a possible answer choice</div>
                    <div class="option">C) Option C - This would be a possible answer choice</div>
                    <div class="option">D) Option D - This would be a possible answer choice</div>
                </div>
            `;
            examQuestions.appendChild(questionContainer);
        }
        
        // Add event listeners to options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                const options = this.parentNode.querySelectorAll('.option');
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        currentQuestionIndex = 0;
        updateQuestionDisplay();
    }
    
    function startTimer() {
        let timeLeft = 2 * 60 * 60; // 2 hours in seconds
        const timerElement = document.getElementById('timer');
        
        const timer = setInterval(function() {
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.textContent = '00:00:00';
                alert('Time is up! Your exam has been automatically submitted.');
                document.getElementById('submit-exam').click();
                return;
            }
            
            timeLeft--;
            
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    function resetExam() {
        currentQuestionIndex = 0;
        updateQuestionDisplay();
    }
    
    function updateAuthButton() {
        if (currentUser) {
            authButton.textContent = 'Dashboard';
        } else {
            authButton.textContent = 'Login';
        }
    }
    
    function updateDashboard() {
        if (!currentUser) return;
        
        userNameSpan.textContent = currentUser.name;
        completedExamsSpan.textContent = userProgress.completedExams;
        averageScoreSpan.textContent = `${userProgress.averageScore}%`;
        studyHoursSpan.textContent = userProgress.studyHours;
        
        // Update progress bars
        Object.keys(userProgress.subjects).forEach(subject => {
            const progress = userProgress.subjects[subject];
            progressElements[subject].progress.textContent = `${progress}%`;
            progressElements[subject].fill.style.width = `${progress}%`;
        });
    }
    
    // Initialize
    updateAuthButton();
    updateQuestionDisplay();
});