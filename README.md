# Frontend Quiz App

A modern, accessible quiz application built with HTML, CSS, and JavaScript. Features a beautiful design system with light and dark themes, responsive layout, and smooth animations.

## 🎯 Features

- **Multiple Quiz Subjects**: HTML, CSS, JavaScript, and Accessibility
- **Light & Dark Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation, screen reader support, and ARIA labels
- **Smooth Animations**: CSS animations with reduced motion support
- **Progress Tracking**: Visual progress bar and question counter
- **Score Display**: Final score with subject information
- **Error Handling**: Graceful error handling with user-friendly messages

## 🎨 Design System

### Colors (HSL)
- **Light Theme Background**: `hsl(220, 33%, 95%)`
- **Dark Theme Background**: `hsl(220, 25%, 20%)`
- **Primary Purple**: `hsl(280, 91%, 56%)`
- **Correct Green**: `hsl(150, 64%, 55%)`
- **Incorrect Red**: `hsl(0, 84%, 66%)`

### Typography
- **Font Family**: Rubik (Variable Font)
- **Font Sizes**: Responsive scale from 14px to 144px (mobile to desktop)
- **Font Weights**: Light (300), Regular (400), Medium (500), Italic (400)

### Spacing
- **Base Unit**: 1rem (16px)
- **Spacing Scale**: 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem
- **Border Radius**: 0.5rem, 1.5rem, 999px (pill)

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start quizzing!** Select a subject and begin answering questions

## 📱 Usage

### Navigation
- **Mouse/Touch**: Click on subject cards and option buttons
- **Keyboard**: Use Tab to navigate, Enter/Space to select
- **Number Keys**: Press 1-4 to quickly select answer options
- **Escape**: Return to start screen from quiz

### Theme Switching
- Click the theme toggle button in the top-right corner
- Theme preference is saved in localStorage
- Supports system color scheme preference

### Quiz Flow
1. **Start Screen**: Choose a subject (HTML, CSS, JavaScript, or Accessibility)
2. **Quiz Questions**: Answer 10 questions per subject
3. **Results**: View your final score and options to play again or return to menu

## 🛠️ Technical Details

### File Structure
```
frontend-quiz-app/
├── index.html          # Main HTML structure
├── style.css           # CSS with design system variables
├── script.js           # JavaScript functionality
├── data.json           # Quiz questions and answers
├── assets/
│   ├── images/         # Icons and images
│   └── fonts/          # Rubik font files
└── README.md           # This file
```

### CSS Architecture
- **CSS Custom Properties**: Design system variables for consistent theming
- **Mobile-First**: Responsive design with progressive enhancement
- **BEM Methodology**: Block Element Modifier naming convention
- **Accessibility**: High contrast ratios and focus indicators

### JavaScript Features
- **ES6+ Classes**: Object-oriented architecture
- **Async/Await**: Modern promise handling
- **Event Delegation**: Efficient event handling
- **Local Storage**: Theme preference persistence
- **Error Handling**: Graceful fallbacks and user feedback

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Live regions and announcements
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Reduced Motion**: Respects user's motion preferences

## 🎭 Animations

All animations are declared in static CSS and respect the `prefers-reduced-motion` media query:

- **Fade In**: Smooth opacity transitions
- **Slide In**: Horizontal slide animations
- **Scale In**: Subtle scaling effects
- **Hover Effects**: Interactive feedback

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **CSS Features**: CSS Grid, Flexbox, Custom Properties
- **JavaScript**: ES6+ features with async/await
- **Fallbacks**: Graceful degradation for older browsers

## 📊 Performance

- **Optimized Images**: SVG icons and optimized PNG assets
- **Efficient CSS**: Minimal reflows and repaints
- **Lazy Loading**: Assets loaded as needed
- **Smooth Animations**: Hardware-accelerated CSS transitions

## 🔧 Customization

### Adding New Subjects
1. Add subject data to `data.json`
2. Include subject icon in `assets/images/`
3. Update icon path in the data

### Modifying Colors
Edit CSS custom properties in `style.css`:
```css
:root {
    --color-primary: hsl(280, 91%, 56%);
    --color-correct: hsl(150, 64%, 55%);
    --color-incorrect: hsl(0, 84%, 66%);
}
```

### Changing Typography
Update font variables in `style.css`:
```css
:root {
    --font-family: 'Your Font', sans-serif;
    --font-size-base: 1.5rem;
}
```

## 📝 License

This project is created for educational purposes. Feel free to use and modify as needed.

## 🙏 Acknowledgments

- **Frontend Mentor**: Design inspiration and challenge
- **Rubik Font**: Beautiful typography by Google Fonts
- **Figma**: Design system and component library
- **Modern Web Standards**: Accessibility and performance best practices

---

**Happy Quizzing! 🎉**
