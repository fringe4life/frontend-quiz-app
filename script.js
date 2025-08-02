/**
 * @typedef {Object} Quiz
 * @property {string} title - The title of the quiz (e.g., "HTML", "CSS")
 * @property {string} icon - The path to the quiz icon image
 * @property {Array<Question>} questions - Array of questions for this quiz
 */

/**
 * @typedef {Object} Question
 * @property {string} question - The question text
 * @property {Array<string>} options - Array of possible answer options
 * @property {string} answer - The correct answer from the options array
 */

/**
 * @typedef {Object} QuizData
 * @property {Array<Quiz>} quizzes - Array of available quizzes
 */

/**
 * Quiz App State Management
 * Main class that handles the quiz application logic, state management, and UI interactions.
 */
class QuizApp {
    /**
     * Creates a new QuizApp instance and initializes the application.
     * @constructor
     */
    constructor() {
        /** @type {Array<Quiz>} Available quizzes loaded from data.json */
        this.quizzes = [];
        
        /** @type {Quiz|null} Currently selected quiz */
        this.currentQuiz = null;
        
        /** @type {number} Current question index (0-based) */
        this.currentQuestionIndex = 0;
        
        /** @type {number} Current score (number of correct answers) */
        this.score = 0;
        
        /** @type {number|null} Index of the currently selected answer option */
        this.selectedAnswer = null;
        
        /** @type {boolean} Whether the current question has been answered */
        this.answered = false;
        
        this.init();
    }
    
    /**
     * Initializes the quiz application by loading data and setting up the UI.
     * @async
     * @throws {Error} If quiz data fails to load
     */
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
    
    /**
     * Loads quiz data from the data.json file.
     * @async
     * @throws {Error} If the fetch request fails or response is not ok
     */
    async loadQuizzes() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            /** @type {QuizData} */
            const data = await response.json();
            this.quizzes = data.quizzes;
        } catch (error) {
            console.error('Error loading quizzes:', error);
            throw error;
        }
    }
    
    /**
     * Sets up all event listeners for user interactions.
     * Includes theme toggle, navigation buttons, submit button, and keyboard events.
     */
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
    
    /**
     * Loads the saved theme from localStorage and applies it to the document.
     * Defaults to 'light' theme if no theme is saved.
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('quiz-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    /**
     * Toggles between light and dark themes.
     * Saves the new theme to localStorage and announces the change for screen readers.
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quiz-theme', newTheme);
        
        // Announce theme change for screen readers
        this.announceToScreenReader(`Switched to ${newTheme} theme`);
    }
    
    /**
     * Renders the start screen with subject selection.
     * Hides all other screens and shows the start screen with subject cards.
     */
    renderStartScreen() {
        this.hideAllScreens();
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.remove('screen-hidden');
        startScreen.classList.add('screen-visible');
        document.getElementById('subject-info').style.display = 'none';
        
        this.renderSubjects();
        this.addAnimation('start-screen', 'fade-in');
    }
    
    /**
     * Renders all available subject cards in the subjects grid.
     * Clears the grid and populates it with subject cards for each quiz.
     */
    renderSubjects() {
        const subjectsGrid = document.getElementById('subjects-grid');
        subjectsGrid.innerHTML = '';
        
        this.quizzes.forEach((quiz, index) => {
            const subjectCard = this.createSubjectCard(quiz, index);
            subjectsGrid.appendChild(subjectCard);
        });
    }
    
    /**
     * Creates a subject card element for the given quiz.
     * @param {Quiz} quiz - The quiz object to create a card for
     * @param {number} index - The index of the quiz in the quizzes array
     * @returns {HTMLElement} The created subject card element
     */
    createSubjectCard(quiz, index) {
        const card = document.createElement('div');
        card.className = 'subject-card start';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Start ${quiz.title} quiz`);

        const template = document.getElementById('subjectTemplate');
  
        // Clone its content
        const clone = template.content.cloneNode(true);
      
        // Query elements within the clone
        const iconDiv = clone.querySelector('.subject-icon');
        const img = clone.querySelector('img');
        const titleHeading = clone.querySelector('.subject-card-title');
      
        // Set dynamic values
        iconDiv.setAttribute('data-subject', quiz.title);
        img.src = quiz.icon;
        img.alt = `${quiz.title} icon`;
        titleHeading.textContent = quiz.title;
      
        // Append to desired container (e.g., body or a specific element)
        card.appendChild(clone);
        
        card.addEventListener('click', () => this.selectSubject(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectSubject(index);
            }
        });
        
        return card;
    }
    
    /**
     * Selects a quiz and starts it.
     * Resets the quiz state and begins the quiz with the selected subject.
     * @param {number} quizIndex - The index of the quiz to select
     */
    selectSubject(quizIndex) {
        this.currentQuiz = this.quizzes[quizIndex];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.answered = false;
        
        this.startQuiz();
    }
    
    /**
     * Starts the selected quiz.
     * Shows the quiz screen, updates the header with subject info, and renders the first question.
     */
    startQuiz() {
        this.hideAllScreens();
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.classList.remove('screen-hidden');
        quizScreen.classList.add('screen-visible');
        document.getElementById('subject-info').style.display = 'flex';
        
        // Update header with subject info
        const subjectIcon = document.querySelector('.subject-info .subject-icon');
        const subjectIconImg = document.getElementById('subject-icon-img');
        
        subjectIcon.setAttribute('data-subject', this.currentQuiz.title);
        subjectIconImg.src = this.currentQuiz.icon;
        subjectIconImg.alt = `${this.currentQuiz.title} icon`;
        document.getElementById('subject-title').textContent = this.currentQuiz.title;
        
        this.renderQuestion();
        this.addAnimation('quiz-screen', 'slide-in');
    }
    
    /**
     * Renders the current question with its options.
     * Updates the question counter, progress bar, question text, and renders answer options.
     */
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
    
    /**
     * Escapes HTML characters in text to prevent XSS attacks.
     * @param {string} text - The text to escape
     * @returns {string} The escaped HTML text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Renders the answer options for the current question.
     * @param {Array<string>} options - Array of answer option strings
     */
    renderOptions(options) {
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        const letters = ['A', 'B', 'C', 'D'];
        
        options.forEach((option, index) => {
            const optionCard = this.createOptionCard(option, letters[index], index);
            optionsGrid.appendChild(optionCard);
        });
    }
    
    /**
     * Creates an option card element for the given option.
     * @param {string} optionText - The text of the option
     * @param {string} letter - The letter label (A, B, C, D)
     * @param {number} index - The index of the option
     * @returns {HTMLElement} The created option card element
     */
    createOptionCard(optionText, letter, index) {
        const card = document.createElement('div');
        card.className = 'option-card start';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Option ${letter}: ${optionText}`);
        
        // Escape the option text to display HTML tags as text
        const escapedOptionText = this.escapeHtml(optionText);

        const template = document.getElementById('optionTemplate');
        const clone = template.content.cloneNode(true);
      
        // Select elements in the cloned fragment
        const letterSpan = clone.querySelector('.letter-text');
        const optionTextDiv = clone.querySelector('.option-text');
      
        // Set dynamic text
        letterSpan.textContent = letter;
        optionTextDiv.innerHTML = escapedOptionText;
        card.appendChild(clone);
        
        card.addEventListener('click', () => this.selectOption(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectOption(index);
            }
        });
        
        return card;
    }
    
    /**
     * Selects an answer option for the current question.
     * Updates the UI to show the selected option and enables the submit button.
     * @param {number} optionIndex - The index of the selected option
     */
    selectOption(optionIndex) {
        if (this.answered) return;
        
        // Remove previous selection
        const previousSelected = document.querySelector('.option-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Select new option
        const optionCards = document.querySelectorAll('.option-card');
        optionCards[optionIndex].classList.add('selected');
        
        this.selectedAnswer = optionIndex;
        document.getElementById('submit-btn').disabled = false;
        
        // Announce selection for screen readers
        const letters = ['A', 'B', 'C', 'D'];
        this.announceToScreenReader(`Selected option ${letters[optionIndex]}`);
    }
    
    /**
     * Submits the selected answer and shows the result.
     * Checks if the answer is correct, updates the score, and shows visual feedback.
     * Auto-advances to the next question after 2 seconds.
     */
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
    
    /**
     * Shows the result of the submitted answer with visual feedback.
     * Displays correct/incorrect icons and updates card styling.
     * @param {boolean} isCorrect - Whether the submitted answer was correct
     */
    showAnswerResult(isCorrect) {
        const optionCards = document.querySelectorAll('.option-card');
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Clear any existing show classes first
        document.querySelectorAll('.option-icon img').forEach(img => {
            img.classList.remove('show');
            img.classList.add('hidden');
        });
        
        optionCards.forEach((card, index) => {
            const optionText = card.querySelector('.option-text').textContent;
            const isSelected = index === this.selectedAnswer;
            const isCorrectAnswer = optionText === question.answer;
            const correctIcon = card.querySelector('.correct-icon');
            const incorrectIcon = card.querySelector('.incorrect-icon');
            
            console.log('Option:', optionText, 'Answer:', question.answer, 'IsCorrect:', isCorrectAnswer, 'IsSelected:', isSelected);
            
            if (isCorrectAnswer) {
                card.classList.add('correct');
                correctIcon.classList.remove('hidden');
                correctIcon.classList.add('show');
                console.log('Showing correct icon for option:', optionText);
            } else if (isSelected && !isCorrectAnswer) {
                card.classList.add('incorrect');
                incorrectIcon.classList.remove('hidden');
                incorrectIcon.classList.add('show');
                console.log('Showing incorrect icon for option:', optionText);
            } else {
                // Ensure other icons are hidden
                correctIcon.classList.remove('show');
                correctIcon.classList.add('hidden');
                incorrectIcon.classList.remove('show');
                incorrectIcon.classList.add('hidden');
            }
        });
        
        // Announce result for screen readers
        const result = isCorrect ? 'Correct!' : 'Incorrect!';
        this.announceToScreenReader(result);
    }
    
    /**
     * Advances to the next question or shows results if all questions are complete.
     * Increments the question index and either renders the next question or shows the results screen.
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            this.showResults();
        } else {
            this.renderQuestion();
        }
    }
    
    /**
     * Shows the results screen with the final score.
     * Updates the results display with subject info, score, and total questions.
     */
    showResults() {
        this.hideAllScreens();
        const resultsScreen = document.getElementById('results-screen');
        resultsScreen.classList.remove('screen-hidden');
        resultsScreen.classList.add('screen-visible');
        document.getElementById('subject-info').style.display = 'flex';
        
        // Update results
        const resultsSubjectIcon = document.getElementById('results-subject-icon');
        resultsSubjectIcon.src = this.currentQuiz.icon;
        resultsSubjectIcon.alt = `${this.currentQuiz.title} icon`;
        resultsSubjectIcon.parentElement.setAttribute('data-subject', this.currentQuiz.title);
        document.getElementById('results-subject-name').textContent = this.currentQuiz.title;
        document.getElementById('score-number').textContent = this.score;
        document.getElementById('results-total').textContent = this.currentQuiz.questions.length;
        
        this.addAnimation('results-screen', 'scale-in');
        
        // Focus first button for accessibility
        setTimeout(() => {
            document.getElementById('play-again-btn').focus();
        }, 100);
    }
    
    /**
     * Shows the start screen and returns to subject selection.
     * Hides all other screens and shows the start screen with subject cards.
     */
    showStartScreen() {
        this.hideAllScreens();
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.remove('screen-hidden');
        startScreen.classList.add('screen-visible');
        document.getElementById('subject-info').style.display = 'none';
        
        this.addAnimation('start-screen', 'fade-in');
        
        // Focus first subject card for accessibility
        setTimeout(() => {
            const firstSubject = document.querySelector('.subject-card');
            if (firstSubject) firstSubject.focus();
        }, 100);
    }
    
    /**
     * Hides all screen elements by adding the screen-hidden class.
     * Used before showing a specific screen to ensure only one screen is visible at a time.
     */
    hideAllScreens() {
        const screens = ['start-screen', 'quiz-screen', 'results-screen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            screen.classList.add('screen-hidden');
            screen.classList.remove('screen-visible');
        });
    }
    
    /**
     * Adds an animation class to an element and removes it after the animation completes.
     * @param {string} elementId - The ID of the element to animate
     * @param {string} animationClass - The CSS animation class to apply
     */
    addAnimation(elementId, animationClass) {
        const element = document.getElementById(elementId);
        element.classList.add(animationClass);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }
    
    /**
     * Handles keyboard events for accessibility and navigation.
     * Supports number keys (1-4) for option selection, Enter for submit, and Escape for navigation.
     * @param {KeyboardEvent} e - The keyboard event object
     */
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
            const quizScreen = document.getElementById('quiz-screen');
            if (!quizScreen.classList.contains('screen-hidden')) {
                this.showStartScreen();
            }
        }
    }
    
    /**
     * Announces a message to screen readers using ARIA live regions.
     * Creates a temporary element with aria-live attribute for screen reader announcements.
     * @param {string} message - The message to announce to screen readers
     */
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
    
    /**
     * Shows an error notification to the user.
     * Creates a styled error message that appears at the top of the screen and auto-removes after 5 seconds.
     * @param {string} message - The error message to display
     */
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