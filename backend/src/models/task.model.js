import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Task text is required'],
    trim: true,
    maxlength: [1000, 'Task text cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  todoList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoList',
    required: [true, 'TodoList reference is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
taskSchema.index({ todoList: 1, completed: 1 });
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });

// Pre-save middleware to set completedAt when task is marked as completed
taskSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.completed && this.completedAt) {
      this.completedAt = null;
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
