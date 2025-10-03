# 🚀 QUICK START GUIDE - Phase 1

## ✅ Prerequisites
- Node.js (v16+)
- Neon PostgreSQL account
- Git

---

## 📦 Step 1: Install Dependencies

Open terminal in `auth_backend` folder:

```bash
cd "D:\DESKTOP-L\College Finder\auth_backend"
npm install
```

---

## 🗄️ Step 2: Setup Neon Database

1. Go to https://neon.tech
2. Sign up / Login
3. Create a new project
4. Copy your **DATABASE_URL** (looks like: `postgresql://user:pass@host/dbname?sslmode=require`)

---

## 🔐 Step 3: Configure Environment

Create `.env` file:

```bash
copy .env.example .env
```

Edit `.env` and fill in:

```env
# Database
DATABASE_URL="your_neon_database_url_here"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_REFRESH_SECRET="your_super_secret_refresh_key_here"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Server
PORT=5000
NODE_ENV=development
```

**💡 Tip:** Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🛠️ Step 4: Initialize Database

```bash
npm run prisma:generate
npm run prisma:push
```

---

## 🎯 Step 5: Start Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 MedPath Auth API - Phase 1               ║
║                                               ║
║   📡 Server: http://localhost:5000            ║
║   🌍 Environment: development                 ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🧪 Step 6: Test API

### Health Check
```bash
curl http://localhost:5000/health
```

### Signup Test
```bash
curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123\",\"fullName\":\"Test User\"}"
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test@123\"}"
```

---

## 📋 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/auth/signup` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/verify` | ✅ | Verify token |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| POST | `/api/auth/logout` | ✅ | Logout user |

---

## 🔍 Verify Database

Open Prisma Studio to see your data:

```bash
npm run prisma:studio
```

This opens `http://localhost:5555` with a GUI to browse your database.

---

## 🐛 Troubleshooting

### Issue: Port 5000 already in use
Change `PORT` in `.env` to another port (e.g., 5001)

### Issue: Database connection error
- Verify your DATABASE_URL is correct
- Check Neon dashboard that database is active
- Ensure `?sslmode=require` is at the end of connection string

### Issue: Prisma errors
```bash
npm run prisma:generate
npx prisma db push --force-reset
```

---

## 📚 Next Steps

✅ **Phase 1 Complete!**

Ready for Phase 2?
- Frontend integration (Login/Signup UI)
- Payment gateway (Razorpay/Stripe)
- Email verification
- Password reset

---

## 🛟 Need Help?

Check `README.md` for detailed documentation.

---

**Happy Coding! 🚀**