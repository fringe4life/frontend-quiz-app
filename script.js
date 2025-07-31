// Quiz App State Management
class QuizApp {
    constructor() {
        this.quizzes = [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.answered = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadQuizzes();
            this.setupEventListeners();
            this.loadTheme();
            this.renderStartScreen();
        } catch (error) {
            console.error('Failed to initialize quiz app:', error);
            this.showError('Failed to load quiz data. Please refresh the page.');
        }
    }
    
    async loadQuizzes() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.quizzes = data.quizzes;
        } catch (error) {
            console.error('Error loading quizzes:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Navigation buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showStartScreen());
        
        // Submit button
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('quiz-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quiz-theme', newTheme);
        
        // Announce theme change for screen readers
        this.announceToScreenReader(`Switched to ${newTheme} theme`);
    }
    
    renderStartScreen() {
        this.hideAllScreens();
        document.getElementById('start-screen').style.display = 'grid';
        document.getElementById('subject-info').style.display = 'none';
        
        this.renderSubjects();
        this.addAnimation('start-screen', 'fade-in');
    }
    
    renderSubjects() {
        const subjectsGrid = document.getElementById('subjects-grid');
        subjectsGrid.innerHTML = '';
        
        this.quizzes.forEach((quiz, index) => {
            const subjectCard = this.createSubjectCard(quiz, index);
            subjectsGrid.appendChild(subjectCard);
        });
    }
    
    createSubjectCard(quiz, index) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Start ${quiz.title} quiz`);
        
        card.innerHTML = `
            <div class="subject-card-icon" data-subject="${quiz.title}">
                <img src="${quiz.icon}" alt="${quiz.title} icon" width="40" height="40">
            </div>
            <h2 class="subject-card-title">${quiz.title}</h2>
        `;
        
        card.addEventListener('click', () => this.selectSubject(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectSubject(index);
            }
        });
        
        return card;
    }
    
    selectSubject(quizIndex) {
        this.currentQuiz = this.quizzes[quizIndex];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.answered = false;
        
        this.startQuiz();
    }
    
    startQuiz() {
        this.hideAllScreens();
        document.getElementById('quiz-screen').style.display = 'grid';
        document.getElementById('subject-info').style.display = 'flex';
        
        // Update header with subject info
        document.getElementById('subject-icon-img').src = this.currentQuiz.icon;
        document.getElementById('subject-icon-img').alt = `${this.currentQuiz.title} icon`;
        document.getElementById('subject-title').textContent = this.currentQuiz.title;
        
        this.renderQuestion();
        this.addAnimation('quiz-screen', 'slide-in');
    }
    
    renderQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Update question counter and progress
        document.getElementById('question-number').textContent = this.currentQuestionIndex + 1;
        document.getElementById('question-total').textContent = this.currentQuiz.questions.length;
        
        const progressPercentage = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
        
        // Update question text - escape HTML tags for display
        const escapedQuestion = this.escapeHtml(question.question);
        
        document.getElementById('question-text').innerHTML = escapedQuestion;
        
        // Render options
        this.renderOptions(question.options);
        
        // Reset state
        this.selectedAnswer = null;
        this.answered = false;
        document.getElementById('submit-btn').disabled = true;
        
        // Focus first option for accessibility
        setTimeout(() => {
            const firstOption = document.querySelector('.option-card');
            if (firstOption) firstOption.focus();
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    renderOptions(options) {
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        const letters = ['A', 'B', 'C', 'D'];
        
        options.forEach((option, index) => {
            const optionCard = this.createOptionCard(option, letters[index], index);
            optionsGrid.appendChild(optionCard);
        });
    }
    
    createOptionCard(optionText, letter, index) {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Option ${letter}: ${optionText}`);
        
        // Escape the option text to display HTML tags as text
        const escapedOptionText = this.escapeHtml(optionText);
        
        card.innerHTML = `
            <div class="option-letter">${letter}</div>
            <div class="option-text">${escapedOptionText}</div>
            <div class="option-icon">
                <img src="./assets/images/icon-correct.svg" alt="Correct answer" width="40" height="40" class="correct-icon" style="display: none;">
                <img src="./assets/images/icon-incorrect.svg" alt="Incorrect answer" width="40" height="40" class="incorrect-icon" style="display: none;">
            </div>
        `;
        
        card.addEventListener('click', () => this.selectOption(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectOption(index);
            }
        });
        
        return card;
    }
    
    selectOption(optionIndex) {
        if (this.answered) return;
        
        // Remove previous selection
        const previousSelected = document.querySelector('.option-card--selected');
        if (previousSelected) {
            previousSelected.classList.remove('option-card--selected');
        }
        
        // Select new option
        const optionCards = document.querySelectorAll('.option-card');
        optionCards[optionIndex].classList.add('option-card--selected');
        
        this.selectedAnswer = optionIndex;
        document.getElementById('submit-btn').disabled = false;
        
        // Announce selection for screen readers
        const letters = ['A', 'B', 'C', 'D'];
        this.announceToScreenReader(`Selected option ${letters[optionIndex]}`);
    }
    
    submitAnswer() {
        if (this.selectedAnswer === null || this.answered) return;
        
        this.answered = true;
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const selectedOption = question.options[this.selectedAnswer];
        const isCorrect = selectedOption === question.answer;
        
        if (isCorrect) {
            this.score++;
        }
        
        this.showAnswerResult(isCorrect);
        
        // Disable submit button
        document.getElementById('submit-btn').disabled = true;
        
        // Auto-advance after showing result
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    showAnswerResult(isCorrect) {
        const optionCards = document.querySelectorAll('.option-card');
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        optionCards.forEach((card, index) => {
            const optionText = card.querySelector('.option-text').textContent;
            const isSelected = index === this.selectedAnswer;
            const isCorrectAnswer = optionText === question.answer;
            const correctIcon = card.querySelector('.correct-icon');
            const incorrectIcon = card.querySelector('.incorrect-icon');
            
            if (isCorrectAnswer) {
                card.classList.add('option-card--correct');
                correctIcon.style.display = 'block';
            } else if (isSelected && !isCorrect) {
                card.classList.add('option-card--incorrect');
                incorrectIcon.style.display = 'block';
            }
        });
        
        // Announce result for screen readers
        const result = isCorrect ? 'Correct!' : 'Incorrect!';
        this.announceToScreenReader(result);
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            this.showResults();
        } else {
            this.renderQuestion();
        }
    }
    
    showResults() {
        this.hideAllScreens();
        document.getElementById('results-screen').style.display = 'block';
        document.getElementById('subject-info').style.display = 'flex';
        
        // Update results
        document.getElementById('results-subject-icon').src = this.currentQuiz.icon;
        document.getElementById('results-subject-icon').alt = `${this.currentQuiz.title} icon`;
        document.getElementById('results-subject-name').textContent = this.currentQuiz.title;
        document.getElementById('score-number').textContent = this.score;
        document.getElementById('results-total').textContent = this.currentQuiz.questions.length;
        
        this.addAnimation('results-screen', 'scale-in');
        
        // Focus first button for accessibility
        setTimeout(() => {
            document.getElementById('play-again-btn').focus();
        }, 100);
    }
    
    showStartScreen() {
        this.hideAllScreens();
        document.getElementById('start-screen').style.display = 'grid';
        document.getElementById('subject-info').style.display = 'none';
        
        this.addAnimation('start-screen', 'fade-in');
        
        // Focus first subject card for accessibility
        setTimeout(() => {
            const firstSubject = document.querySelector('.subject-card');
            if (firstSubject) firstSubject.focus();
        }, 100);
    }
    
    hideAllScreens() {
        const screens = ['start-screen', 'quiz-screen', 'results-screen'];
        screens.forEach(screenId => {
            document.getElementById(screenId).style.display = 'none';
        });
    }
    
    addAnimation(elementId, animationClass) {
        const element = document.getElementById(elementId);
        element.classList.add(animationClass);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }
    
    handleKeyboard(e) {
        // Handle option selection with number keys (1-4)
        if (e.key >= '1' && e.key <= '4' && !this.answered) {
            const optionIndex = parseInt(e.key) - 1;
            const optionCards = document.querySelectorAll('.option-card');
            if (optionCards[optionIndex]) {
                this.selectOption(optionIndex);
            }
        }
        
        // Handle submit with Enter key
        if (e.key === 'Enter' && this.selectedAnswer !== null && !this.answered) {
            this.submitAnswer();
        }
        
        // Handle Escape key to go back
        if (e.key === 'Escape') {
            if (document.getElementById('quiz-screen').style.display !== 'none') {
                this.showStartScreen();
            }
        }
    }
    
    announceToScreenReader(message) {
        // Create a temporary element for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove the element after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        
        // Style the error notification
        errorDiv.style.cssText = `
            position: fixed;
            top: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-incorrect);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 1000;
            font-weight: 500;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Screen reader only class
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
}); 