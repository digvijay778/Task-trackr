import express from 'express';
import {
  getAllTodoLists,
  getTodoListById,
  createTodoList,
  updateTodoList,
  toggleArchiveTodoList,
  deleteTodoList,
  getTodoListStats
} from '../controllers/todolist.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/todolists - Get all todo lists for user
router.get('/', getAllTodoLists);

// GET /api/v1/todolists/stats - Get user's todo list statistics
router.get('/stats', getTodoListStats);

// POST /api/v1/todolists - Create new todo list
router.post('/', createTodoList);

// GET /api/v1/todolists/:id - Get specific todo list with tasks
router.get('/:id', getTodoListById);

// PUT /api/v1/todolists/:id - Update todo list
router.put('/:id', updateTodoList);

// PATCH /api/v1/todolists/:id/archive - Toggle archive status
router.patch('/:id/archive', toggleArchiveTodoList);

// DELETE /api/v1/todolists/:id - Delete todo list and all tasks
router.delete('/:id', deleteTodoList);

export default router;
