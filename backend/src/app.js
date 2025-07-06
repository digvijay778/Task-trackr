import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middlewares/errorMiddleware.js';

// Import routes
import userRoutes from './routes/user.routes.js';
import todoListRoutes from './routes/todolist.routes.js';
import taskRoutes from './routes/taskRoutes.js';
import path from 'path';
const app = express();

// ==============================================
// Middleware Configuration
// ==============================================
const __dirname = path.resolve();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(express.static('public'));

// ==============================================
// API Routes
// ==============================================
app.use('/api/v1/user', userRoutes);          // Auth-related routes
app.use('/api/v1/todolists', todoListRoutes); // TodoList routes
app.use('/api/v1/tasks', taskRoutes);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}
// Task routes

// ==============================================
// Health Check
// ==============================================
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==============================================
// 404 Handler
// ==============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        suggestion: 'Check the API documentation for available endpoints'
    });
});

// ==============================================
// Error Handling (Should be last middleware)
// ==============================================
app.use(errorMiddleware);

export default app;
