# 🚀 START ALL SERVERS - STEP BY STEP

## ⚠️ IMPORTANT: Follow these steps in order!

---

## 1️⃣ **AUTH BACKEND** (Port 5000)

```powershell
# Open Terminal 1
cd "D:\DESKTOP-L\College Finder\auth_backend"

# Install dependencies (if needed)
npm install

# Generate Prisma Client (IMPORTANT!)
npx prisma generate

# Start the server
npm start
```

**✅ Expected Output:**
```
╔═══════════════════════════════════════════════╗
║   🚀 MedPath Auth API - Phase 1               ║
║   📡 Server: http://localhost:5000            ║
║   🌍 Environment: development                 ║
╚═══════════════════════════════════════════════╝
✅ Connected to Neon PostgreSQL database
```

**❌ If you see errors:**
- Check `.env` file exists
- Run: `npx prisma db push` (if schema changes)
- Check DATABASE_URL is correct

---

## 2️⃣ **ML BACKEND** (Port 8002)

```powershell
# Open Terminal 2
cd "D:\DESKTOP-L\College Finder\ultimate_backend"

# Activate virtual environment (if you have one)
# .\venv\Scripts\Activate.ps1

# Start the server
python main.py
```

**✅ Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8002
```

---

## 3️⃣ **FRONTEND** (Port 3001 or 5173)

```powershell
# Open Terminal 3
cd "D:\DESKTOP-L\College Finder\ML_frontend"

# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

**✅ Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 **VERIFY ALL SERVICES**

Open browser and check:

1. **Auth Backend:** http://localhost:5000/health
   - Should show: `{"status": "healthy", ...}`

2. **ML Backend:** http://localhost:8002/docs
   - Should show: FastAPI Swagger UI

3. **Frontend:** http://localhost:5173/ or http://localhost:3001/
   - Should show: MedPath homepage

---

## 🔍 **TROUBLESHOOTING**

### Error: "Cannot read properties of undefined (reading 'findFirst')"
**Solution:**
```powershell
cd "D:\DESKTOP-L\College Finder\auth_backend"
npx prisma generate
npm start
```

### Error: "Port already in use"
**Solution:**
```powershell
# Find process using the port
netstat -ano | findstr :5000
# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Error: "Module not found"
**Solution:**
```powershell
# Auth backend
cd "D:\DESKTOP-L\College Finder\auth_backend"
npm install

# Frontend
cd "D:\DESKTOP-L\College Finder\ML_frontend"
npm install
```

---

## 📝 **TEST THE COMPLETE FLOW**

1. Go to: http://localhost:5173/signup
2. Click "Sign Up"
3. Choose Email or Phone
4. Fill the form
5. Verify OTP (check console for OTP if email doesn't work)
6. **Payment modal appears** ← Should show ₹1199
7. Click "Pay ₹1199"
8. Complete payment with test card:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: Any future date
9. Account activated → Dashboard

---

## 🎯 **QUICK START (All in one)**

```powershell
# Terminal 1
cd "D:\DESKTOP-L\College Finder\auth_backend" ; npx prisma generate ; npm start

# Terminal 2
cd "D:\DESKTOP-L\College Finder\ultimate_backend" ; python main.py

# Terminal 3
cd "D:\DESKTOP-L\College Finder\ML_frontend" ; npm run dev
```

---

**✨ Everything should now work perfectly!**
