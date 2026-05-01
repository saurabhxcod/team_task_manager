# 🚀 TaskSync: Professional Team Task Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**TaskSync** is a high-performance, full-stack task management application designed for modern teams. Built with a focus on speed, security, and professional aesthetics, it empowers teams to collaborate seamlessly with real-time status tracking and robust role-based access control.

---

## ✨ Key Features

- **🔐 Enterprise-Grade Auth**: Secure JWT-based authentication with refresh token rotation and cookie-based sessions.
- **🛡️ Dynamic RBAC**: Role-Based Access Control (Admin/Member) managed at the project level.
- **📊 Interactive Dashboard**: High-level visual overview of project health, task distribution, and overdue items.
- **📋 Kanban Task Board**: Advanced drag-and-drop board for intuitive task state management.
- **🎨 Professional UI**: Premium "Standard UI" design featuring clean aesthetics, responsive layouts, and smooth micro-interactions.
- **🌍 Scalable Backend**: RESTful API architecture powered by Express and Prisma, fully integrated with PostgreSQL.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Professional Theme)
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit

### Backend
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Bcrypt, JWT
- **Validation**: Joi

---

## ⚙️ Quick Start

### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd Team_Task_Manager
```

### 2️⃣ Backend Configuration
1. Navigate to `/backend`
2. Install dependencies: `npm install`
3. Set up `.env`:
   ```env
   PORT=5000
   DATABASE_URL="your_postgresql_url"
   JWT_ACCESS_SECRET="your_secret"
   JWT_REFRESH_SECRET="your_secret"
   ```
4. Push schema and seed data:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. Start server: `npm run dev`

### 3️⃣ Frontend Configuration
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Set up `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
4. Start application: `npm run dev`

---

## 👥 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@team.com` | `Password123!` |
| **Member** | `member1@team.com` | `Password123!` |

---

## 📝 API Documentation
Detailed API endpoints and collection available in [postman_collection.json](./postman_collection.json).

### Auth Endpoints
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Authenticate user
- `GET /api/v1/auth/me` - Get current session

### Project Endpoints
- `GET /api/v1/projects` - List user projects
- `POST /api/v1/projects` - Create new project
- `PATCH /api/v1/projects/:id` - Update project (Admin only)

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed as a high-standard Full-Stack Assignment.*
