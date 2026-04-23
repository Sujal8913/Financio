# Financio — Wealth Growth Habit Tracker

A fully functional full-stack web application for tracking financial habits, expenses, and savings goals.

## 🚀 Quick Start

### Option 1: One-click launch
Double-click `start.bat` to launch both servers automatically.

### Option 2: Manual start

**Backend** (Terminal 1):
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🗂️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Charts | Recharts |

## 📸 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Sign in with email/password |
| Register | `/register` | Create new account |
| Dashboard | `/dashboard` | Overview: stats, charts, habits, goals |
| Habits | `/habits` | Manage & check off daily habits |
| Expenses | `/expenses` | Track income & expenses |
| Goals | `/goals` | Savings goals with progress |
| Analytics | `/analytics` | Charts & wealth projections |
| Profile | `/profile` | Edit user settings |
| Admin | `/admin` | Admin-only user management |

## 🔐 Environment Variables

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/financio
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## ⚡ Notes

- MongoDB must be running locally for full data persistence
- The app works without MongoDB (API returns errors gracefully)
- First registered user can be promoted to admin via the database
