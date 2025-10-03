const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client with logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
});

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL database');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from database');
});

module.exports = prisma;