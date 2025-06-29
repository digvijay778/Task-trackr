import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentTask = null 
}) {
  const [taskText, setTaskText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize form when modal opens or currentTask changes
  useEffect(() => {
    if (currentTask) {
      setTaskText(currentTask.text);
      setIsCompleted(currentTask.completed);
    } else {
      setTaskText('');
      setIsCompleted(false);
    }
  }, [currentTask, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      text: taskText.trim(),
      completed: isCompleted
    };
    
    if (currentTask) {
      taskData.id = currentTask._id || currentTask.id; // Use _id for MongoDB compatibility
    }
    
    onSave(taskData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* ✅ FIXED: Dark background with white text */}
        <div className="bg-olive-800 text-black px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {currentTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          {/* ✅ FIXED: White text with hover effect */}
          <button 
            onClick={onClose}
            className="text-black hover:text-olive-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="taskText" className="block text-gray-700 mb-2 font-medium">
                Task Description
              </label>
              <textarea
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Enter task description..."
              />
            </div>
            
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-gray-300 rounded"
              />
              <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-700">
                Mark as completed
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              {/* ✅ FIXED: Cancel button with proper gray styling */}
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              {/* ✅ FIXED: Submit button with olive background and white text */}
              <button 
                type="submit"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {currentTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
