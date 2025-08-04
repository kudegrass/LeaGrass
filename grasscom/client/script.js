document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    
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
    
    // Subject cards click event
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach(card => {
        card.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            alert(`Opening review materials for ${formatSubjectName(subject)}\n\nThis feature will display detailed review content for the selected subject area.`);
        });
    });
    
    // Mock exam cards click event
    const examCards = document.querySelectorAll('.exam-card');
    
    examCards.forEach(card => {
        card.addEventListener('click', function() {
            const exam = this.getAttribute('data-exam');
            alert(`${formatSubjectName(exam)} Mock Exam started!\n\nIn a real implementation, this would load a 100-question exam with a 2-hour timer.`);
        });
    });
    
    // Start review button
    document.getElementById('start-review-btn').addEventListener('click', function() {
        window.scrollTo({
            top: document.getElementById('review-materials').offsetTop - 80,
            behavior: 'smooth'
        });
    });
    
    // Functions
    function formatSubjectName(subject) {
        return subject.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
});
