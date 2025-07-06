import TodoList from '../models/todoList.model.js';
import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asynchandler.js';

// Get all todo lists for authenticated user
export const getAllTodoLists = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', archived = false } = req.query;
  
  const query = {
    owner: req.user._id,
    isArchived: archived === 'true'
  };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const todoLists = await TodoList.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('tasksCount');
  
  const total = await TodoList.countDocuments(query);
  
  res.status(200).json(new ApiResponse(200, {
    todoLists,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }, 'Todo lists fetched successfully'));
});

// Get single todo list with tasks
export const getTodoListById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const todoList = await TodoList.findOne({
    _id: id,
    owner: req.user._id
  });
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  // Get associated tasks
  const tasks = await Task.find({
    todoList: id,
    owner: req.user._id
  }).sort({ createdAt: -1 });
  
  res.status(200).json(new ApiResponse(200, {
    todoList,
    tasks
  }, 'Todo list fetched successfully'));
});

// Create new todo list
export const createTodoList = asyncHandler(async (req, res) => {
  const { title, description, color } = req.body;
  
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }
  
  const todoList = await TodoList.create({
    title,
    description,
    color,
    owner: req.user._id
  });
  
  res.status(201).json(new ApiResponse(201, todoList, 'Todo list created successfully'));
});

// Update todo list
export const updateTodoList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, color } = req.body;
  
  const todoList = await TodoList.findOneAndUpdate(
    { _id: id, owner: req.user._id },
    { title, description, color },
    { new: true, runValidators: true }
  );
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  res.status(200).json(new ApiResponse(200, todoList, 'Todo list updated successfully'));
});

// Archive/Unarchive todo list
export const toggleArchiveTodoList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const todoList = await TodoList.findOne({
    _id: id,
    owner: req.user._id
  });
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  todoList.isArchived = !todoList.isArchived;
  await todoList.save();
  
  res.status(200).json(new ApiResponse(200, todoList, 
    `Todo list ${todoList.isArchived ? 'archived' : 'unarchived'} successfully`
  ));
});

// Delete todo list (and all associated tasks)
export const deleteTodoList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const todoList = await TodoList.findOne({
    _id: id,
    owner: req.user._id
  });
  
  if (!todoList) {
    throw new ApiError(404, 'Todo list not found');
  }
  
  // Delete all associated tasks
  await Task.deleteMany({ todoList: id, owner: req.user._id });
  
  // Delete the todo list
  await TodoList.findByIdAndDelete(id);
  
  res.status(200).json(new ApiResponse(200, {}, 'Todo list and associated tasks deleted successfully'));
});

// Get todo list statistics
export const getTodoListStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const stats = await TodoList.aggregate([
    { $match: { owner: userId } },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'todoList',
        as: 'tasks'
      }
    },
    {
      $group: {
        _id: null,
        totalLists: { $sum: 1 },
        archivedLists: {
          $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] }
        },
        totalTasks: { $sum: { $size: '$tasks' } },
        completedTasks: {
          $sum: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.completed', true] }
              }
            }
          }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalLists: 0,
    archivedLists: 0,
    totalTasks: 0,
    completedTasks: 0
  };
  
  res.status(200).json(new ApiResponse(200, result, 'Statistics fetched successfully'));
});
