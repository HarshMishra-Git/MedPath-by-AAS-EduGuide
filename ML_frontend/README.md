# NEET ML Predictor Frontend

A premium React frontend application for AI-powered NEET college admission predictions with advanced ML integration, built with React 18, Tailwind CSS, and Framer Motion.

![NEET ML Predictor](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=NEET+ML+Predictor+-+AI+Powered+College+Predictions)

## 🚀 Features

### ✨ Core Features
- **AI-Powered Predictions**: Real-time integration with ML backend for accurate college admission predictions
- **Advanced UI/UX**: Premium design with smooth animations and micro-interactions
- **Responsive Design**: Optimized for mobile, tablet, and desktop experiences
- **Multi-Step Form**: Intelligent prediction form with real-time validation and progress tracking
- **Rich Visualizations**: Interactive charts and data visualizations for results analysis
- **Real-time Analytics**: Dynamic predictions with live updates and trend analysis

### 🎨 Design & Animation
- **Premium Theme System**: Custom color palette optimized for medical/educational context
- **Smooth Animations**: Framer Motion animations with performance optimization
- **Glassmorphism Effects**: Modern glass-effect UI components with backdrop blur
- **Micro-interactions**: Hover effects, loading states, and interactive feedback
- **Accessibility Compliant**: WCAG 2.1 AA standards with screen reader support

### 🔧 Technical Features
- **Modern React 18**: Using latest React features including concurrent rendering
- **TypeScript Ready**: Full TypeScript support for type-safe development
- **Advanced State Management**: Optimized state handling with React hooks
- **API Integration**: Comprehensive ML API client with error handling and retry logic
- **Progressive Web App**: PWA features for offline functionality
- **Performance Optimized**: Code splitting, lazy loading, and bundle optimization

## 🛠️ Technology Stack

### Frontend Core
- **React 18.2** - Modern React with concurrent features
- **Vite 4.4** - Lightning fast build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework with custom design system
- **Framer Motion 10.16** - Production-ready motion library for React

### Form & Validation
- **React Hook Form 7.45** - Performant forms with easy validation
- **Zod 3.22** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolver for React Hook Form

### UI & Visualization
- **Lucide React** - Beautiful & consistent icon library
- **Recharts 2.8** - Composable charting library for React
- **React Circular Progressbar** - Customizable circular progress indicators
- **React CountUp** - Animated counter component

### Animations & Effects
- **React Spring 9.7** - Spring-physics based animations
- **React Particles** - Interactive particle backgrounds
- **React Confetti** - Celebration animations
- **Lottie React** - Render After Effects animations

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing with plugins
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** (version 1.22 or higher)
- **Git** for version control

```bash
# Check your versions
node --version  # Should be 18.0+
npm --version   # Should be 8.0+
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/neet-ml-predictor.git
cd neet-ml-predictor/ML_frontend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Configure your environment variables:

```env
# API Configuration
VITE_ML_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Application Settings
VITE_APP_NAME="NEET ML Predictor"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="AI-Powered NEET College Admission Predictions"

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DEBUG=false

# External Services (Optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:3001`

### 5. Build for Production

```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

## 📁 Project Structure

```
ML_frontend/
├── public/                     # Public assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/                    # API clients and services
│   │   └── mlApi.js           # ML backend API integration
│   ├── components/             # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.jsx     # Navigation header
│   │   │   └── Footer.jsx     # Footer component
│   │   └── ui/                # UI components
│   │       └── LoadingScreen.jsx
│   ├── pages/                  # Page components
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── AboutPage.jsx      # About page
│   │   ├── ContactPage.jsx    # Contact page
│   │   ├── PredictionPage.jsx # Prediction form
│   │   ├── ResultsPage.jsx    # Results display
│   │   └── NotFoundPage.jsx   # 404 page
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── constants/              # Application constants
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── .env.example               # Environment variables example
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🎨 Design System

### Color Palette

The application uses a carefully crafted color system optimized for medical/educational context:

```css
/* Primary Colors - Medical/Healthcare Theme */
--primary-50: #f0f9ff
--primary-500: #0ea5e9
--primary-900: #0c4a6e

/* Medical/Healthcare Secondary */
--medical-50: #f0fdfa
--medical-500: #14b8a6
--medical-900: #134e4a

/* Success/Prediction Colors */
--success-50: #f0fdf4
--success-500: #22c55e
--success-900: #14532d

/* Neural Network/AI Colors */
--neural-50: #faf5ff
--neural-500: #a855f7
--neural-900: #581c87
```

### Typography

- **Display Font**: Space Grotesk - Used for headings and display text
- **Body Font**: Inter - Used for body text and UI elements
- **Mono Font**: JetBrains Mono - Used for code and technical content

### Component Classes

The application includes custom utility classes for consistent styling:

```css
/* Premium Buttons */
.btn-primary        /* Primary action buttons */
.btn-secondary      /* Secondary action buttons */
.btn-gradient       /* Gradient buttons for CTAs */
.btn-neural         /* AI/ML themed buttons */

/* Premium Cards */
.card-premium       /* Standard premium cards */
.card-gradient      /* Gradient background cards */
.card-medical       /* Medical themed cards */
.card-neural        /* AI/ML themed cards */

/* Input Fields */
.input-premium      /* Styled form inputs */

/* Text Gradients */
.text-gradient-primary  /* Primary gradient text */
.text-gradient-neural   /* Neural network gradient text */
```

## 🔌 API Integration

The frontend integrates with the ML backend through a comprehensive API client (`src/api/mlApi.js`) that provides:

### Core Methods
- `predict(studentData)` - Get ML predictions for student data
- `getRecommendations(studentData, options)` - Get college recommendations
- `getCollegeDetails(collegeCode)` - Fetch detailed college information
- `getCutoffTrends(collegeCode, courseCode)` - Get historical cutoff data

### Utility Methods
- `checkHealth()` - API health monitoring
- `getModelInfo()` - ML model information
- `submitFeedback(feedbackData)` - User feedback submission
- `exportResults(predictionId, format)` - Export predictions as PDF/JSON

### Error Handling
- Automatic retry logic for failed requests
- User-friendly error messages
- Request timeout handling
- Connection status monitoring

Example usage:

```javascript
import { mlApiService, apiUtils } from './api/mlApi'

// Transform form data and make prediction
const studentData = apiUtils.transformStudentData(formData)
try {
  const results = await mlApiService.predict(studentData)
  const formattedResults = apiUtils.formatPredictionResponse(results)
  // Handle successful prediction
} catch (error) {
  // Handle prediction error
  console.error(error.userMessage)
}
```

## 📱 Responsive Design

The application is fully responsive across all device sizes:

### Breakpoints
- **Mobile**: `< 768px` - Optimized for touch interactions
- **Tablet**: `768px - 1024px` - Balanced layout with collapsible elements
- **Desktop**: `> 1024px` - Full-featured layout with sidebars
- **Large Desktop**: `> 1600px` - Enhanced spacing and larger components

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Collapsible navigation menu
- Swipe gestures for carousel components
- Optimized form layouts for mobile input
- Safe area insets for modern mobile devices

## ⚡ Performance Optimization

### Build Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Built-in bundle size analysis
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization

### Runtime Optimizations
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large data sets
- **Memoization**: React.memo and useMemo for expensive computations
- **Debouncing**: API calls and search inputs

### Performance Monitoring
```bash
# Analyze bundle size
npm run build
npm run analyze

# Performance testing
npm run perf
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing (to be implemented)
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run end-to-end tests

# Utilities
npm run analyze      # Analyze bundle size
npm run type-check   # TypeScript type checking
```

### Development Guidelines

#### Component Structure
```javascript
// Component template
import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from 'lucide-react'

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks and state
  const [state, setState] = useState(initialState)
  
  // Event handlers
  const handleEvent = () => {
    // Handle event
  }
  
  // Render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="component-class"
    >
      {/* Component content */}
    </motion.div>
  )
}

export default ComponentName
```

#### Styling Guidelines
- Use Tailwind CSS utility classes for styling
- Create custom component classes for repeated patterns
- Follow the established color palette and spacing system
- Ensure accessibility compliance (WCAG 2.1 AA)
- Test across different screen sizes and devices

#### State Management
- Use React hooks for local component state
- Context API for global state when needed
- Custom hooks for reusable stateful logic
- Avoid prop drilling with composition patterns

## 🚀 Deployment

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Static Hosting (Recommended)

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --dir=dist --prod
```

#### Traditional Web Server
```bash
# Build the application
npm run build

# The dist/ folder contains the built application
# Upload contents to your web server
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build Docker image
docker build -t neet-ml-frontend .

# Run container
docker run -p 80:80 neet-ml-frontend
```

### Environment Variables for Production

```env
# Production API endpoint
VITE_ML_API_URL=https://api.neet-ml-predictor.com

# Analytics and monitoring
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://your-sentry-dsn

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DEBUG=false
```

## 🔧 Configuration

### Tailwind CSS Customization

Modify `tailwind.config.js` to customize the design system:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
        brand: '#your-brand-color',
      },
      animation: {
        // Add custom animations
        'custom-bounce': 'customBounce 2s infinite',
      },
    },
  },
  plugins: [
    // Add Tailwind plugins
  ],
}
```

### Vite Configuration

Customize build settings in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Custom chunk splitting
        }
      }
    }
  }
})
```

## 🐛 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
npm run dev -- --port 3002
```

#### API Connection Issues
1. Check if ML backend is running
2. Verify API URL in environment variables
3. Check network connectivity
4. Review browser console for CORS errors

#### Styling Issues
1. Ensure Tailwind CSS is properly installed
2. Check if PostCSS is configured correctly
3. Verify custom CSS imports in index.css
4. Clear browser cache

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Support**: Contact support team via contact form in the app

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Test your changes: `npm run test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style Guidelines
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Ensure accessibility compliance
- Test on multiple browsers and devices

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Tests added for new features
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind Labs** - For Tailwind CSS
- **Framer** - For Framer Motion animation library
- **Lucide** - For beautiful icons
- **Vercel** - For Vite build tool
- **Open Source Community** - For all the amazing packages used

## 📞 Support

- **Email**: support@neet-ml-predictor.com
- **Documentation**: [GitHub Wiki](https://github.com/your-username/neet-ml-predictor/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/neet-ml-predictor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/neet-ml-predictor/discussions)

---

**Made with ❤️ for NEET aspirants**

*Empowering students with AI-driven insights for their medical education journey*