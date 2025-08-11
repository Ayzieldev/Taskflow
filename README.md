# Goal Tracker Frontend

A modern, flexible goal tracking application built with React, TypeScript, and SCSS.

## 🚀 Features

- **Flexible Task Management**: Create single tasks or grouped tasks with subtasks
- **Step-by-Step Mode**: Lock tasks in sequence for structured progress
- **Reward System**: Set rewards for task completion and goal achievement
- **Theme Support**: Light and dark mode with automatic system preference detection
- **Offline-First**: Works offline with local storage persistence
- **Responsive Design**: Mobile-first approach with modern UI
- **PWA Support**: Installable as a Progressive Web App
- **Mobile Optimized**: Touch-friendly interactions and mobile-specific features

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling with BEM methodology
- **React Router** - Client-side routing
- **Local Storage** - Offline data persistence
- **PWA** - Progressive Web App capabilities
- **Electron** - Desktop app support

## 📁 Project Structure

```
src/
├── components/
│   ├── design/          # UI components
│   └── logic/           # Business logic components
├── context/             # React contexts
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API and external services
├── styles/              # SCSS files
│   ├── abstracts/       # Variables and mixins
│   ├── base/           # Reset and base styles
│   ├── components/     # Component styles
│   ├── layout/         # Layout styles
│   ├── pages/          # Page styles
│   ├── themes/         # Theme styles
│   └── vendors/        # Third-party styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design System

### Color Palette
- **Primary**: `#d8b2ff` (Light Purple)
- **Secondary**: `#b266ff` (Medium Purple)
- **Accent**: `#4500e2` (Deep Purple)
- **Dark**: `#3100a2` (Dark Purple)
- **Darkest**: `#4c0099` (Very Dark Purple)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ayzieldev/Task-Flow.git
cd Task-Flow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run electron-dev` - Start Electron development
- `npm run electron-dist` - Build Electron app

## 📱 Mobile Features

### PWA Installation
- **Add to Home Screen**: Install as a native app
- **Offline Support**: Works without internet connection
- **Mobile Optimized**: Touch-friendly interface
- **Haptic Feedback**: Vibration feedback on mobile
- **Smart Redirect**: Installed PWAs skip landing page

### Mobile Gestures
- **Swipe**: Navigate between sections
- **Tap**: Quick actions and navigation
- **Long Press**: Context menus and options

## 🖥️ Desktop Features

### Electron App
- **Native Desktop App**: Windows executable (.exe)
- **System Integration**: Native window controls
- **Offline Functionality**: Full local storage support
- **Auto-updater**: Automatic updates (planned)

## 🌐 Deployment

### Netlify Deployment
This app is configured for Netlify deployment with the following settings:

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18
- **Environment**: Production

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure SPA routing (all routes redirect to index.html)

### Environment Variables
No environment variables required for basic functionality.

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow BEM methodology for CSS classes
- Use SCSS variables and mixins for consistency
- Write descriptive component and function names

### Component Structure
- Separate logic and design components
- Use custom hooks for reusable logic
- Implement proper TypeScript interfaces
- Follow React best practices

### Styling
- Use SCSS with BEM methodology
- Leverage design system variables
- Ensure responsive design
- Maintain accessibility standards

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured for clean imports
- ESLint integration for code quality

### SCSS
- Modular structure with partials
- Design system with variables and mixins
- Theme support for light/dark modes

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Features

### Goal Management
- Create, edit, and delete goals
- Set deadlines and priorities
- Track progress with visual indicators
- Step-by-step mode for structured progress

### Task System
- Flexible task creation
- Subtask support
- Task completion tracking
- Reward system integration

### PWA Features
- Offline functionality
- Home screen installation
- Native app experience
- Background sync (planned)

### Theme System
- Light and dark mode
- Automatic system preference detection
- Smooth theme transitions
- Persistent theme selection

## 🚀 Live Demo

Visit the live application: [Goal Tracker](https://your-netlify-url.netlify.app)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue on GitHub. 