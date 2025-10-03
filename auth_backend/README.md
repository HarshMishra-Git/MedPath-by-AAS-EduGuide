# 🔐 MedPath Authentication & Payment API

**Phase 1: Authentication Backend with JWT**

This is the authentication and payment backend for MedPath NEET College Predictor, built with Node.js, Express, and Neon PostgreSQL.

---

## 📋 **PHASE 1 - CURRENT STATUS**

✅ Project structure created  
✅ Prisma schema defined  
✅ Environment template created  
⏳ Dependencies installation (YOU NEED TO DO THIS)  
⏳ Database setup (YOU NEED TO DO THIS)  
⏳ Remaining files creation (IN PROGRESS)

---

## 🚀 **QUICK START - PHASE 1 SETUP**

### **1. Install Dependencies**

```bash
cd "D:\DESKTOP-L\College Finder\auth_backend"
npm install
```

### **2. Set Up Neon PostgreSQL Database**

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up/Login (FREE account)
3. Create a new project named "medpath-auth"
4. Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.neon.tech/database`)

### **3. Create .env File**

```bash
# Copy the .env.example
copy .env.example .env

# Edit .env and add your database URL
# DATABASE_URL="postgresql://your_connection_string_from_neon"
```

### **4. Generate JWT Secrets**

Run this command to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Copy these values into your `.env` file.

### **5. Initialize Prisma and Database**

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### **6. Start the Server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be running at: **http://localhost:5000**

---

##  🏗️ **PROJECT STRUCTURE**

```
auth_backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Prisma client setup
│   ├── controllers/     # Route controllers
│   │   └── auth.controller.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js
│   │   └── rate-limiter.js
│   ├── routes/          # API routes
│   │   └── auth.routes.js
│   ├── services/        # Business logic
│   │   └── jwt.service.js
│   ├── utils/           # Utility functions
│   │   └── validators.js
│   └── server.js        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables (YOU CREATE THIS)
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

---

## 📡 **API ENDPOINTS (Phase 1)**

### **Authentication Endpoints**

#### **1. Register New User (Manual)**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+919876543210",
  "fullName": "John Doe",
  "password": "SecurePassword123!"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "accountStatus": "PENDING_PAYMENT"
  },
  "token": "jwt_token_here"
}
```

#### **2. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "accountStatus": "PENDING_PAYMENT",
      "paymentStatus": "PENDING"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### **3. Verify Token**
```http
GET /api/auth/verify
Headers:
  Authorization: Bearer jwt_token_here

Response (200):
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "accountStatus": "PENDING_PAYMENT"
  }
}
```

#### **4. Logout**
```http
POST /api/auth/logout
Headers:
  Authorization: Bearer jwt_token_here

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### **5. Get User Profile**
```http
GET /api/auth/profile
Headers:
  Authorization: Bearer jwt_token_here

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "emailVerified": false,
    "phoneVerified": false,
    "paymentStatus": "PENDING",
    "accountStatus": "PENDING_PAYMENT",
    "createdAt": "2025-01-30T10:00:00.000Z"
  }
}
```

---

## 🧪 **TESTING THE API**

### **Using cURL:**

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"Test123!","phone":"+919876543210"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Verify Token (replace YOUR_TOKEN)
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Using Postman:**
1. Import the collection from `postman_collection.json` (coming soon)
2. Set environment variable `baseUrl` = `http://localhost:5000`
3. Test the endpoints

---

## 🔧 **ENVIRONMENT VARIABLES**

Copy `.env.example` to `.env` and fill in these critical values:

| Variable | Description | Required | Phase |
|----------|-------------|----------|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ Yes | 1 |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes | 1 |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | ✅ Yes | 1 |
| `FRONTEND_URL` | React app URL for CORS | ✅ Yes | 1 |
| `PORT` | API server port (default: 5000) | No | 1 |
| `GOOGLE_CLIENT_ID` | Google OAuth credentials | No | 2 |
| `RAZORPAY_KEY_ID` | Razorpay payment keys | No | 3 |

---

## 📦 **DEPENDENCIES**

### **Production:**
- `express` - Web framework
- `@prisma/client` - Database ORM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `helmet` - Security headers
- `cors` - Cross-origin requests
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `dotenv` - Environment variables
- `cookie-parser` - Cookie parsing
- `morgan` - HTTP logging

### **Development:**
- `nodemon` - Auto-restart server
- `prisma` - Database toolkit

---

## 🔒 **SECURITY FEATURES (Phase 1)**

✅ Password hashing with bcrypt (12 rounds)  
✅ JWT authentication with refresh tokens  
✅ Rate limiting (100 requests per 15 minutes)  
✅ Helmet.js security headers  
✅ CORS configuration  
✅ Input validation and sanitization  
✅ SQL injection prevention (Prisma ORM)  
✅ Session management  

---

## 🐛 **TROUBLESHOOTING**

### **Database Connection Error**
```
Error: P1001: Can't reach database server
```
**Solution:** Check your `DATABASE_URL` in `.env` file. Ensure Neon database is accessible.

### **Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```
**Solution:** Run `npm run prisma:generate`

### **Port Already in Use**
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:** Change `PORT` in `.env` or kill the process using port 5000.

### **JWT Token Invalid**
```
Error: jwt malformed
```
**Solution:** Ensure you're sending the token in the `Authorization: Bearer TOKEN` header format.

---

## 📈 **NEXT PHASES**

### **Phase 2: OAuth + OTP (Coming Next)**
- Google OAuth 2.0 integration
- Email OTP verification
- SMS OTP verification (Twilio)
- Frontend login/signup pages

### **Phase 3: Payment Integration**
- Razorpay payment gateway
- Payment verification
- Protected routes
- Payment webhooks

### **Phase 4: Final Integration**
- Connect with FastAPI ML backend
- Complete frontend integration
- Production deployment
- Load testing

---

## 📞 **SUPPORT**

For issues or questions:
- Email: contact@alladmission.co.in
- Phone: +91 97216 36379

---

## 📄 **LICENSE**

MIT License - AAS EduGuide

---

**🎉 Phase 1 Complete! Ready to integrate with frontend once remaining files are created.**