import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaEdit } from 'react-icons/fa';

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
    if (!taskText.trim()) return;
    
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

  const handleClose = () => {
    setTaskText('');
    setIsCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-700/50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {currentTask ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
            </div>
            <h3 className="font-semibold text-lg text-white">
              {currentTask ? 'Edit Task' : 'Add New Task'}
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Task Description */}
            <div>
              <label htmlFor="taskText" className="block text-gray-300 mb-3 font-medium">
                Task Description
              </label>
              <textarea
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows="4"
                placeholder="Enter your task description..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-2">
                {taskText.length}/500 characters
              </div>
            </div>
            
            {/* Completion Status */}
            <div className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
              <input
                type="checkbox"
                id="isCompleted"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600 rounded mt-0.5"
              />
              <div>
                <label htmlFor="isCompleted" className="block text-gray-300 font-medium">
                  Mark as completed
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Check this if the task is already finished
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
              <button 
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!taskText.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  taskText.trim() 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaSave className="text-sm" />
                <span>{currentTask ? 'Update Task' : 'Add Task'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
