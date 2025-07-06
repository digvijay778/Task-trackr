import Task from '../models/task.model.js';
import TodoList from '../models/todoList.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asynchandler.js';

// Get all tasks for a specific todo list
export const getTasksByTodoList = asyncHandler(async (req, res) => {
  const { todoListId } = req.params;
  const { completed, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  // Verify todo list ownership
  const todoList = await TodoList.findOne({
    _id: todoListId,
    owner: req.user._id
  });
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  const query = {
    todoList: todoListId,
    owner: req.user._id
  };
  
  if (completed !== undefined) {
    query.completed = completed === 'true';
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const tasks = await Task.find(query).sort(sortOptions);
  
  res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'));
});

// Get single task
export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const task = await Task.findOne({
    _id: id,
    owner: req.user._id
  }).populate('todoList', 'title color');
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  res.status(200).json(new ApiResponse(200, task, 'Task fetched successfully'));
});

// Create new task
export const createTask = asyncHandler(async (req, res) => {
  const { text, todoListId, priority, dueDate } = req.body;
  
  if (!text || !todoListId) {
    throw new ApiError(400, 'Text and todoListId are required');
  }
  
  // Verify todo list ownership
  const todoList = await TodoList.findOne({
    _id: todoListId,
    owner: req.user._id
  });
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  const task = await Task.create({
    text,
    todoList: todoListId,
    owner: req.user._id,
    priority,
    dueDate
  });
  
  res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

// Update task
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, completed, priority, dueDate } = req.body;
  
  const task = await Task.findOneAndUpdate(
    { _id: id, owner: req.user._id },
    { text, completed, priority, dueDate },
    { new: true, runValidators: true }
  );
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'));
});

// Toggle task completion
export const toggleTaskCompletion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const task = await Task.findOne({
    _id: id,
    owner: req.user._id
  });
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  task.completed = !task.completed;
  await task.save();
  
  res.status(200).json(new ApiResponse(200, task, 'Task completion toggled successfully'));
});

// Delete task
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const task = await Task.findOneAndDelete({
    _id: id,
    owner: req.user._id
  });
  
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  
  res.status(200).json(new ApiResponse(200, {}, 'Task deleted successfully'));
});

// Delete multiple tasks
export const deleteMultipleTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;
  
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError(400, 'Task IDs array is required');
  }
  
  const result = await Task.deleteMany({
    _id: { $in: taskIds },
    owner: req.user._id
  });
  
  res.status(200).json(new ApiResponse(200, {
    deletedCount: result.deletedCount
  }, `${result.deletedCount} tasks deleted successfully`));
});

// Mark multiple tasks as completed
export const markMultipleTasksCompleted = asyncHandler(async (req, res) => {
  const { taskIds, completed = true } = req.body;
  
  if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError(400, 'Task IDs array is required');
  }
  
  const result = await Task.updateMany(
    {
      _id: { $in: taskIds },
      owner: req.user._id
    },
    { 
      completed,
      completedAt: completed ? new Date() : null
    }
  );
  
  res.status(200).json(new ApiResponse(200, {
    modifiedCount: result.modifiedCount
  }, `${result.modifiedCount} tasks updated successfully`));
});
