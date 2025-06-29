import mongoose from 'mongoose';

const todoListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#6B7280', // Default gray color
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
todoListSchema.index({ owner: 1, createdAt: -1 });

// Virtual for tasks count (if needed)
todoListSchema.virtual('tasksCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'todoList',
  count: true
});

// Ensure virtuals are included in JSON output
todoListSchema.set('toJSON', { virtuals: true });

const TodoList = mongoose.model('TodoList', todoListSchema);
export default TodoList;
