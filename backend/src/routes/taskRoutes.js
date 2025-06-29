import express from 'express';
import {
  getTasksByTodoList,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  deleteMultipleTasks,
  markMultipleTasksCompleted
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/tasks/todolist/:todoListId - Get all tasks for a todo list
router.get('/todolist/:todoListId', getTasksByTodoList);

// POST /api/v1/tasks - Create new task
router.post('/', createTask);

// PATCH /api/v1/tasks/bulk/complete - Mark multiple tasks as completed
router.patch('/bulk/complete', markMultipleTasksCompleted);

// DELETE /api/v1/tasks/bulk - Delete multiple tasks
router.delete('/bulk', deleteMultipleTasks);

// GET /api/v1/tasks/:id - Get specific task
router.get('/:id', getTaskById);

// PUT /api/v1/tasks/:id - Update task
router.put('/:id', updateTask);

// PATCH /api/v1/tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', toggleTaskCompletion);

// DELETE /api/v1/tasks/:id - Delete task
router.delete('/:id', deleteTask);

export default router;
