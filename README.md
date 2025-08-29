# Task-trackr 📝

A full-stack MERN (MongoDB, Express.js, React, Node.js) todo application for efficient task and project management. Built with modern web technologies and featuring a clean, responsive UI.

## ✨ Features

### 🔐 Authentication & Security
- User registration and login with JWT authentication
- Password reset functionality via email
- Secure password hashing with bcrypt
- Cookie-based session management
- Protected routes and middleware

### 📋 Task Management
- Create, edit, and delete todo lists
- Add, update, and remove tasks within lists
- Mark tasks as completed/incomplete
- Organize tasks by custom categories
- Color-coded lists for better organization

### 🎨 User Experience
- Responsive design with Tailwind CSS
- Clean and intuitive interface
- Real-time updates
- Loading states and error handling
- Mobile-friendly design

### 📧 Email Features
- Password reset emails via Nodemailer
- Email notifications for important actions

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **JWT Decode** - Token handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Task-trackr/
├── backend/                 # Server-side application
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── db/              # Database connection
│   └── package.json
├── frontend/                # Client-side application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── Context/         # React context
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/digvijay778/Task-trackr.git
   cd Task-trackr
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run build
   
   # Or install individually
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/task-trackr
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # CORS
   CORS_ORIGIN=http://localhost:5173
   
   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Environment
   NODE_ENV=development
   ```

4. **Start the application**
   
   **Development mode:**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend (from frontend directory)
   cd frontend
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   # Build and start (from root directory)
   npm run build
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Health Check: http://localhost:8000/api/v1/health

## 📡 API Endpoints

### Authentication
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/logout` - User logout
- `POST /api/v1/user/forgot-password` - Forgot password
- `POST /api/v1/user/reset-password/:token` - Reset password

### Todo Lists
- `GET /api/v1/todolists` - Get all todo lists
- `POST /api/v1/todolists` - Create new todo list
- `PUT /api/v1/todolists/:id` - Update todo list
- `DELETE /api/v1/todolists/:id` - Delete todo list

### Tasks
- `GET /api/v1/tasks/:listId` - Get tasks for a list
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🔧 Scripts

### Root Level
- `npm run build` - Install dependencies for both frontend and backend, build frontend
- `npm start` - Start the production server

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Production Build
1. Set `NODE_ENV=production` in your environment
2. Update `CORS_ORIGIN` to your production domain
3. Run `npm run build` from the root directory
4. Start with `npm start`

### Deployment Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify (if serving separately)
- **Database**: MongoDB Atlas, Railway PostgreSQL
- **Full-stack**: Railway, Render, Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Digvijay** - [GitHub Profile](https://github.com/digvijay778)

## 🙏 Acknowledgments

- React team for the amazing library
- Express.js community
- MongoDB team
- Tailwind CSS for the utility-first approach
- Vite for the lightning-fast build tool

---

⭐ If you found this project helpful, please give it a star on GitHub!
