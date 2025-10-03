# 🏗️ System Architecture - Phase 1

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   React UI   │      │   Axios/     │      │  LocalStorage│  │
│  │  (Future)    │─────▶│   Fetch      │─────▶│  (Tokens)    │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                │ HTTPS (REST API)
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                         SERVER SIDE                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Express.js Server (Port 5000)             │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Helmet     │  │    CORS      │  │   Morgan     │ │    │
│  │  │  (Security)  │  │ (Cross-Origin│  │  (Logging)   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │          Rate Limiter Middleware                 │ │    │
│  │  │  • General: 100 req/15min                        │ │    │
│  │  │  • Auth: 5 attempts/15min                        │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │                Route Handler                      │ │    │
│  │  │                                                   │ │    │
│  │  │  /health           ──▶  Health Check             │ │    │
│  │  │  /api/auth/signup  ──▶  Registration             │ │    │
│  │  │  /api/auth/login   ──▶  Authentication           │ │    │
│  │  │  /api/auth/verify  ──▶  Token Verification       │ │    │
│  │  │  /api/auth/profile ──▶  Get User Data            │ │    │
│  │  │  /api/auth/logout  ──▶  Session Termination      │ │    │
│  │  │                                                   │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Business Logic Layer                    │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │ Controllers  │  │  Services    │  │  Middleware  │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  │ • Auth       │  │ • JWT        │  │ • Auth       │ │    │
│  │  │   Controller │  │   Service    │  │   Middleware │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘ │    │
│  │         │                 │                             │    │
│  │         └─────────────────┴─────────────────┐          │    │
│  │                                             │          │    │
│  │  ┌──────────────────────────────────────────▼───────┐ │    │
│  │  │             Validation Layer                     │ │    │
│  │  │  • Email validation                              │ │    │
│  │  │  • Password strength check                       │ │    │
│  │  │  • Phone format validation                       │ │    │
│  │  │  • Input sanitization                            │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                 │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 │
┌────────────────────────────────▼─────────────────────────────────┐
│                       DATABASE LAYER                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Neon PostgreSQL (Serverless)                   │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │    Users     │  │   Sessions   │  │   Payments   │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  │ • id         │  │ • id         │  │ • id         │ │    │
│  │  │ • email      │  │ • userId     │  │ • userId     │ │    │
│  │  │ • password   │  │ • token      │  │ • amount     │ │    │
│  │  │ • fullName   │  │ • refresh    │  │ • status     │ │    │
│  │  │ • status     │  │ • expiresAt  │  │ • gateway    │ │    │
│  │  │ • ...        │  │ • ...        │  │ • ...        │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

### Registration Flow
```
1. User submits signup form
   ↓
2. Request hits Rate Limiter (100 req/15min)
   ↓
3. Input Validation (email, password, fullName)
   ↓
4. Check if user already exists
   ↓
5. Hash password with bcrypt (12 rounds)
   ↓
6. Create user in database
   ↓
7. Generate JWT tokens (access + refresh)
   ↓
8. Create session record
   ↓
9. Return tokens + user data to client
```

### Login Flow
```
1. User submits login credentials
   ↓
2. Request hits Auth Rate Limiter (5 attempts/15min)
   ↓
3. Input Validation (email, password)
   ↓
4. Find user by email
   ↓
5. Verify password with bcrypt.compare()
   ↓
6. Check account status (ACTIVE, SUSPENDED, etc.)
   ↓
7. Generate JWT tokens
   ↓
8. Create new session
   ↓
9. Update lastLogin timestamp
   ↓
10. Return tokens + user data to client
```

### Protected Route Access
```
1. Client sends request with Authorization header
   ↓
2. Auth Middleware extracts token
   ↓
3. JWT Service verifies token signature
   ↓
4. Check session exists in database
   ↓
5. Check session not expired
   ↓
6. Check user account status
   ↓
7. Attach user data to request
   ↓
8. Continue to route handler
```

---

## 🗂️ Project Structure

```
auth_backend/
│
├── src/
│   │
│   ├── server.js                  # 🚀 Application entry point
│   │   ├── Express app setup
│   │   ├── Middleware configuration
│   │   ├── Route mounting
│   │   └── Error handling
│   │
│   ├── config/
│   │   └── database.js            # 🗄️ Prisma client setup
│   │
│   ├── routes/
│   │   └── auth.routes.js         # 🛣️ API endpoint definitions
│   │       ├── POST /signup       (public)
│   │       ├── POST /login        (public)
│   │       ├── GET  /verify       (protected)
│   │       ├── GET  /profile      (protected)
│   │       └── POST /logout       (protected)
│   │
│   ├── controllers/
│   │   └── auth.controller.js     # 🎮 Business logic handlers
│   │       ├── signup()           # User registration
│   │       ├── login()            # User authentication
│   │       ├── verify()           # Token validation
│   │       ├── getProfile()       # User data retrieval
│   │       └── logout()           # Session destruction
│   │
│   ├── services/
│   │   └── jwt.service.js         # 🔐 Token management
│   │       ├── generateAccessToken()
│   │       ├── generateRefreshToken()
│   │       ├── verifyAccessToken()
│   │       ├── verifyRefreshToken()
│   │       └── generateTokenPair()
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     # 🛡️ Authentication guard
│   │   │   ├── Extract token from header
│   │   │   ├── Verify JWT signature
│   │   │   ├── Check session validity
│   │   │   └── Attach user to request
│   │   │
│   │   └── rate-limiter.js        # ⏱️ Request throttling
│   │       ├── apiLimiter         (100 req/15min)
│   │       └── authLimiter        (5 attempts/15min)
│   │
│   └── utils/
│       └── validators.js          # ✅ Input validation
│           ├── signupValidation   (email, password, name, phone)
│           ├── loginValidation    (email, password)
│           └── validate()         (error handling)
│
├── prisma/
│   └── schema.prisma              # 📊 Database schema
│       ├── User model
│       ├── Session model
│       └── Payment model
│
├── .env.example                   # 🔧 Environment template
├── .gitignore                     # 🚫 Git exclusions
├── package.json                   # 📦 Dependencies & scripts
├── README.md                      # 📖 Full documentation
├── QUICKSTART.md                  # ⚡ Quick setup guide
├── IMPLEMENTATION_GUIDE.md        # 💻 Code implementation
├── PHASE_1_COMPLETE.md            # ✅ Completion summary
└── ARCHITECTURE.md                # 🏗️ This file
```

---

## 🔐 Security Architecture

### Layer 1: Network Security
```
┌─────────────────────────────────────┐
│       Helmet (HTTP Headers)         │
│  • X-Content-Type-Options           │
│  • X-Frame-Options                  │
│  • X-XSS-Protection                 │
│  • Strict-Transport-Security        │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       CORS (Cross-Origin)           │
│  • Allowed origins                  │
│  • Credentials handling             │
│  • Allowed methods & headers        │
└─────────────────────────────────────┘
```

### Layer 2: Rate Limiting
```
┌─────────────────────────────────────┐
│       Rate Limiter                  │
│  • IP-based throttling              │
│  • Endpoint-specific limits         │
│  • DDoS protection                  │
└─────────────────────────────────────┘
```

### Layer 3: Input Validation
```
┌─────────────────────────────────────┐
│     Express Validator               │
│  • Email format                     │
│  • Password complexity              │
│  • SQL injection prevention         │
│  • XSS attack prevention            │
└─────────────────────────────────────┘
```

### Layer 4: Authentication
```
┌─────────────────────────────────────┐
│          JWT + Sessions             │
│  • Token signature verification     │
│  • Expiry validation                │
│  • Session database check           │
│  • User status verification         │
└─────────────────────────────────────┘
```

### Layer 5: Data Protection
```
┌─────────────────────────────────────┐
│       Bcrypt Hashing                │
│  • Password hashing (12 rounds)     │
│  • Salt generation                  │
│  • Secure comparison                │
└─────────────────────────────────────┘
```

---

## 📦 Data Flow

### Signup Data Flow
```
[Client Form]
    ↓
{ email, password, fullName, phone? }
    ↓
[Rate Limiter: 100 req/15min]
    ↓
[Validation: email format, password strength, name length]
    ↓
[Controller: Check duplicate email/phone]
    ↓
[Bcrypt: Hash password (12 rounds)]
    ↓
[Prisma: Create user record]
    ↓
{ id, email, fullName, accountStatus: PENDING_PAYMENT }
    ↓
[JWT Service: Generate access + refresh tokens]
    ↓
{ accessToken, refreshToken }
    ↓
[Prisma: Create session record]
    ↓
{ token, userId, expiresAt, ipAddress, userAgent }
    ↓
[Response to Client]
    ↓
{
  success: true,
  data: { userId, email, fullName, accountStatus, paymentStatus },
  token: "eyJhbGc...",
  refreshToken: "eyJhbGc..."
}
```

### Login Data Flow
```
[Client Form]
    ↓
{ email, password }
    ↓
[Auth Rate Limiter: 5 attempts/15min]
    ↓
[Validation: email format, password presence]
    ↓
[Prisma: Find user by email]
    ↓
[Bcrypt: Compare password with hash]
    ↓
[Check: Account status (ACTIVE, SUSPENDED, DELETED)]
    ↓
[JWT Service: Generate tokens]
    ↓
[Prisma: Create session + Update lastLogin]
    ↓
[Response to Client]
    ↓
{
  success: true,
  data: {
    user: { id, email, fullName, accountStatus, paymentStatus },
    token: "eyJhbGc...",
    refreshToken: "eyJhbGc..."
  }
}
```

---

## 🔄 Session Management

### Session Lifecycle
```
┌──────────────────────────────────────────────────────────┐
│                    Session Creation                       │
│                                                           │
│  1. User logs in successfully                            │
│  2. Generate JWT access token (expires in 1h)            │
│  3. Generate JWT refresh token (expires in 7d)           │
│  4. Store session in database:                           │
│     {                                                     │
│       token: "access_token",                             │
│       refreshToken: "refresh_token",                     │
│       userId: "user_id",                                 │
│       expiresAt: "2024-01-01T12:00:00Z",                │
│       ipAddress: "192.168.1.1",                          │
│       userAgent: "Mozilla/5.0..."                        │
│     }                                                     │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                   Session Validation                      │
│                                                           │
│  On each protected route request:                        │
│  1. Extract token from Authorization header              │
│  2. Verify JWT signature                                 │
│  3. Check token not expired                              │
│  4. Find session in database                             │
│  5. Check session.expiresAt > now                        │
│  6. Check user.accountStatus !== DELETED                 │
│  7. Attach user data to request                          │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  Session Termination                      │
│                                                           │
│  On logout:                                              │
│  1. Extract token from request                           │
│  2. Delete session from database                         │
│  3. Client discards tokens                               │
│                                                           │
│  On expiry:                                              │
│  1. JWT expires (1h for access)                          │
│  2. Session remains in DB until cleanup                  │
│  3. Client can use refresh token to get new access token │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Relations

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id: String (CUID)                                     │  │
│  │ email: String (unique)                                │  │
│  │ passwordHash: String                                  │  │
│  │ fullName: String                                      │  │
│  │ phone: String? (unique)                               │  │
│  │ accountStatus: String (PENDING_PAYMENT/ACTIVE/etc.)   │  │
│  │ paymentStatus: String (PENDING/PAID/FAILED)           │  │
│  │ createdAt: DateTime                                   │  │
│  │ updatedAt: DateTime                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│         ┌─────────────────┴─────────────────┐               │
│         │                                   │               │
│         ▼                                   ▼               │
│  ┌──────────────┐                  ┌──────────────┐        │
│  │   Sessions   │                  │   Payments   │        │
│  │              │                  │              │        │
│  │ • token      │                  │ • amount     │        │
│  │ • refresh    │                  │ • status     │        │
│  │ • expiresAt  │                  │ • gateway    │        │
│  │ • ipAddress  │                  │ • metadata   │        │
│  │              │                  │              │        │
│  │ userId ─────────────────────────── userId      │        │
│  └──────────────┘                  └──────────────┘        │
│                                                              │
│  Cascade Delete: When User deleted → Sessions + Payments   │
│                  are automatically deleted                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Performance Considerations

### Optimizations
- ✅ Database connection pooling (Prisma)
- ✅ JWT validation (stateless, no DB hit on every request)
- ✅ Password hashing async (non-blocking)
- ✅ Indexed database fields (email, token)
- ✅ Rate limiting (prevents abuse)

### Scalability
- ✅ Stateless authentication (JWT)
- ✅ Serverless database (Neon)
- ✅ Horizontal scaling ready
- ✅ No in-memory session store

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
│                                                          │
│  [Domain] → [Cloudflare CDN] → [Load Balancer]         │
│                                        ↓                 │
│                          ┌─────────────┴─────────────┐  │
│                          │                           │  │
│                    [Node Server 1]            [Node Server 2]
│                          │                           │  │
│                          └─────────────┬─────────────┘  │
│                                        ↓                 │
│                                [Neon PostgreSQL]         │
│                                                          │
│  Features:                                               │
│  • SSL/TLS encryption                                    │
│  • Auto-scaling instances                                │
│  • Health checks                                         │
│  • Logging & monitoring                                  │
│  • Backup & recovery                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Technology Stack

| Layer          | Technology          | Purpose                    |
|----------------|---------------------|----------------------------|
| Runtime        | Node.js v16+        | JavaScript execution       |
| Framework      | Express.js          | Web application framework  |
| Database       | PostgreSQL (Neon)   | Data persistence           |
| ORM            | Prisma              | Database abstraction       |
| Authentication | JWT                 | Stateless auth tokens      |
| Password Hash  | Bcrypt              | Secure password storage    |
| Validation     | Express-validator   | Input sanitization         |
| Security       | Helmet              | HTTP headers protection    |
| Rate Limiting  | express-rate-limit  | Request throttling         |
| Logging        | Morgan              | HTTP request logging       |
| CORS           | cors package        | Cross-origin handling      |

---

## 🎯 Design Principles

1. **Separation of Concerns**
   - Routes → Controllers → Services → Database
   - Each layer has single responsibility

2. **Security First**
   - Multiple security layers
   - Input validation at every entry point
   - Rate limiting on sensitive endpoints

3. **Scalability**
   - Stateless authentication
   - Serverless database
   - Horizontal scaling ready

4. **Developer Experience**
   - Clear folder structure
   - Comprehensive documentation
   - Type-safe with Prisma

5. **Production Ready**
   - Error handling
   - Logging
   - Health checks
   - Environment configuration

---

**Architecture designed for production-grade authentication! 🚀**