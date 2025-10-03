# 🎓 NEET College Finder

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/college-finder)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.2+-61DAFB.svg)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/node.js-18+-339933.svg)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-009688.svg)](https://fastapi.tiangolo.com)

> AI-Powered Medical College Admission Prediction System with Authentication & Payment Integration

## System Architecture

```mermaid
graph TB
    A[Web Browser] --> B[React Frontend<br/>Port 3001]
    B --> C[Auth Backend<br/>Port 5000<br/>Node.js]
    B --> D[Ultimate Backend<br/>Port 8002<br/>Python]
    B --> E[NEET Backend<br/>Port 8001<br/>Python]
    C --> F[(PostgreSQL)]
    C --> G[Razorpay]
    C --> H[Google OAuth]
    D --> I[(CSV Data)]
    E --> I
```

## Features

- 🔍 Smart College Search with Multiple Filters
- 📊 Admission Probability Analysis
- 💰 Financial Planning & ROI Calculations
- 🔐 Secure JWT Authentication
- 💳 Razorpay Payment Integration
- 🌐 Google OAuth Login
- 📱 Responsive Mobile Design

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion

**Backend (Auth):** Node.js, Express, Prisma, PostgreSQL, JWT

**Backend (ML):** Python, FastAPI, Pandas, NumPy

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (or Neon DB)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/college-finder.git
cd college-finder

# Setup Frontend
cd ML_frontend
npm install
cp .env.example .env

# Setup Auth Backend
cd ../auth_backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push

# Setup Python Backends
cd ../ultimate_backend
pip install -r requirements.txt

cd ../neet_college_finder_backend
pip install -r requirements.txt
```

### Running

```bash
# Terminal 1
cd ML_frontend && npm run dev

# Terminal 2
cd auth_backend && npm run dev

# Terminal 3
cd ultimate_backend && python start_ultimate_server.py

# Terminal 4
cd neet_college_finder_backend && python start_server.py
```

**Access:**
- Frontend: http://localhost:3001
- Auth API: http://localhost:5000
- Ultimate API: http://localhost:8002/docs
- NEET API: http://localhost:8001/docs

## Project Structure

```
College-Finder/
├── ML_frontend/              # React application
├── auth_backend/             # Node.js auth API
├── ultimate_backend/         # FastAPI ML backend
├── neet_college_finder_backend/
├── data/raw/                 # CSV datasets
└── docs/                     # Documentation
```

## Configuration

### Frontend (.env)
```
VITE_ML_API_URL=http://localhost:8002
VITE_AUTH_API_URL=http://localhost:5000
```

### Auth Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_...
GOOGLE_CLIENT_ID=...
```

## Deployment

- **Frontend:** Vercel
- **Backend:** Railway/Render
- **Database:** Neon PostgreSQL

## License

MIT License

---

**Built with ❤️ for NEET aspirants**
