require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactRoutes = require('./routes/contact.routes');
const { setupAdminUser } = require('./utils/setup-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://neet-pg-college-finder.vercel.app',
  'https://med-path-by-aas-edu-guide.vercel.app',
  'https://medpath.aaseduguide.com',
  'http://medpath.aaseduguide.com'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MedPath Auth API',
    version: '1.0.0 - Phase 1'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🚀 MedPath Auth API - Phase 1               ║
  ║                                               ║
  ║   📡 Server: http://localhost:${PORT}         ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
  ║   📅 Started: ${new Date().toLocaleString()}  ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
  
  // Setup admin user on startup
  await setupAdminUser();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});