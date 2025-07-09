import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaPen,
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaList,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaTasks,
  FaCheckCircle,
} from "react-icons/fa";
import TaskModal from "./TaskModal";
import todoService from "../../services/todoService";
import authService from "../../services/authService";

export default function TodoList({ onLogout }) {
  // State management - ✅ FIXED: Ensure lists is always an array
  const [state, setState] = useState({
    lists: [], // ✅ Always initialize as empty array
    currentListId: null,
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [modalData, setModalData] = useState({
    listName: "",
    listId: "",
    confirmAction: null,
    confirmMessage: "",
  });

  // ✅ FIXED: Better API response handling for your backend structure
  const reloadAllData = async () => {
    try {
      const response = await todoService.getLists();
      
      console.log('Full API response:', response);
      console.log('Response data:', response?.data);
      
      let listsData = [];
      
      if (response?.data) {
        // ✅ FIXED: Handle your specific backend response structure
        if (response.data.todoLists && Array.isArray(response.data.todoLists)) {
          listsData = response.data.todoLists;
          console.log('Found todoLists array:', listsData);
        } else if (Array.isArray(response.data)) {
          listsData = response.data;
        } else {
          console.log('Unexpected API response structure:', response.data);
          listsData = [];
        }
      }
      
      // ✅ FIXED: For each list, fetch its tasks if it has any
      const listsWithTasks = await Promise.all(
        listsData.map(async (list) => {
          if (list.tasksCount > 0) {
            try {
              // Fetch tasks for this specific list
              const tasksResponse = await todoService.getTasksByTodoList(list._id);
              return {
                ...list,
                tasks: tasksResponse?.data || []
              };
            } catch (error) {
              console.warn(`Failed to fetch tasks for list ${list._id}:`, error);
              return {
                ...list,
                tasks: []
              };
            }
          } else {
            return {
              ...list,
              tasks: []
            };
          }
        })
      );
      
      console.log('Final processed lists with tasks:', listsWithTasks);
      
      setState((prev) => ({
        ...prev,
        lists: listsWithTasks,
        currentListId: prev.currentListId && listsWithTasks.find(list => list._id === prev.currentListId) 
          ? prev.currentListId 
          : (listsWithTasks.length > 0 ? listsWithTasks[0]._id : null),
      }));
    } catch (err) {
      console.error("Error reloading data:", err);
      setError("Failed to reload data. Please try again.");
      setState(prev => ({ ...prev, lists: [] }));
    }
  };

  // Load data from API on component mount
  useEffect(() => {
    const loadTodoLists = async () => {
      try {
        setLoading(true);
        setError(null);
        await reloadAllData();
      } catch (err) {
        console.error("Error loading todo lists:", err);
        setError("Failed to load your todo lists. Please try again.");
        setState({ lists: [], currentListId: null });
      } finally {
        setLoading(false);
      }
    };

    loadTodoLists();
  }, []);

  // Helper function to update state
  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  // ✅ FIXED: List operations with proper data reloading
  const createNewList = async (e) => {
    e.preventDefault();
    if (!modalData.listName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await todoService.createTodoList({
        title: modalData.listName.trim(),
      });

      console.log('Create list response:', response);

      // ✅ FIXED: Reload all data after creating list
      await reloadAllData();

      // Set the new list as current if we have the response
      if (response?.data?._id) {
        updateState({ currentListId: response.data._id });
      }

      // Reset modal
      setModalData({ ...modalData, listName: "" });
      setShowNewListModal(false);
    } catch (err) {
      console.error("Error creating list:", err);
      setError("Failed to create new list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateList = async (e) => {
    e.preventDefault();
    if (!modalData.listName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await todoService.updateTodoList(modalData.listId, {
        title: modalData.listName.trim(),
      });

      // ✅ FIXED: Reload all data after updating list
      await reloadAllData();

      setShowEditListModal(false);
    } catch (err) {
      console.error("Error updating list:", err);
      setError("Failed to update list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId) => {
    if (!listId) {
      setError("Invalid list ID. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await todoService.deleteTodoList(listId);

      // ✅ FIXED: Reload all data after deleting list
      await reloadAllData();

      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error deleting list:", err);
      setError("Failed to delete list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Task operations with proper data reloading
  const handleSaveTask = async (taskData) => {
    if (!state.currentListId) {
      setError("Please select a list first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (taskData.id || taskData._id) {
        // Update existing task
        const taskId = taskData.id || taskData._id;
        await todoService.updateTask(taskId, {
          text: taskData.text,
          completed: taskData.completed,
          todoListId: state.currentListId,
        });
      } else {
        // Add new task
        await todoService.addTask({
          text: taskData.text,
          completed: taskData.completed,
          todoListId: state.currentListId,
        });
      }

      // ✅ FIXED: Reload all data after task operation
      await reloadAllData();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId) => {
    if (!state.currentListId) {
      setError("Please select a list first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await todoService.toggleTask(taskId);

      // ✅ FIXED: Reload all data after toggling task
      await reloadAllData();
    } catch (err) {
      console.error("Error toggling task completion:", err);
      setError("Failed to update task status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!state.currentListId) {
      setError("Please select a list first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await todoService.deleteTask(taskId);

      // ✅ FIXED: Reload all data after deleting task
      await reloadAllData();

      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authService.logout();
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  // Modal handlers
  const showListModal = (listId = null) => {
    if (listId) {
      const list = (state.lists || []).find((l) => l._id === listId);
      if (list) {
        setModalData({
          ...modalData,
          listName: list.title || list.name,
          listId: list._id,
        });
        setShowEditListModal(true);
      }
    } else {
      setModalData({ ...modalData, listName: "" });
      setShowNewListModal(true);
    }
  };

  const showDeleteConfirmation = (message, action) => {
    setModalData({
      ...modalData,
      confirmMessage: message,
      confirmAction: action,
    });
    setShowConfirmModal(true);
  };

  // ✅ FIXED: Safe access to current list data with proper fallbacks
  const currentList = Array.isArray(state.lists) 
    ? state.lists.find((list) => list._id === state.currentListId)
    : null;
  const pendingTasks =
    currentList?.tasks?.filter((task) => !task.completed)?.length || 0;

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <FaTasks className="text-white text-lg" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              TaskTrackr
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => showListModal()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaPlus className="mr-2" /> New List
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <span className="text-gray-300 font-medium hidden md:block">
                  {userData.name || 'User'}
                </span>
                <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 z-50">
                  <div className="p-3 border-b border-gray-700/50">
                    <p className="text-white font-medium">{userData.name || 'User'}</p>
                    <p className="text-gray-400 text-sm">{userData.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 transition-colors duration-200 rounded-b-xl"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Click outside to close dropdown */}
        {showProfileDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowProfileDropdown(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Lists Sidebar */}
          <div className="w-full lg:w-1/3 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-white flex items-center">
                <FaList className="mr-2" />
                Your Lists
              </h2>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {(state.lists || []).length}
              </span>
            </div>
            
            <div className="h-96 overflow-y-auto p-4">
              {loading && (state.lists || []).length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading your lists...</p>
                </div>
              ) : (state.lists || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FaList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="mb-4">No lists yet. Create one!</p>
                  <button
                    onClick={() => showListModal()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FaPlus className="mr-2" /> Create List
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(state.lists || []).map((list, index) => {
                    const listKey = list._id || `list-${index}`;
                    const listPendingTasks = (list.tasks || []).filter(
                      (task) => !task.completed
                    ).length;
                    const isActive = state.currentListId === list._id;

                    return (
                      <div
                        key={listKey}
                        className={`group relative p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
                            : "bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30"
                        }`}
                        onClick={() => updateState({ currentListId: list._id })}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              listPendingTasks > 0 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                : 'bg-gray-600'
                            }`}>
                              <FaCheckCircle className="text-white text-sm" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white mb-1">
                                {list.title || list.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {listPendingTasks} pending • {(list.tasks || []).length} total
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                showListModal(list._id);
                              }}
                            >
                              <FaPen className="text-xs" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (list._id) {
                                  showDeleteConfirmation(
                                    "Are you sure you want to delete this list and all its tasks?",
                                    () => deleteList(list._id)
                                  );
                                }
                              }}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Main Area */}
          <div className="w-full lg:w-2/3 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
            {loading && !currentList ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <h3 className="text-xl font-medium text-white mb-2">
                  Loading your tasks...
                </h3>
              </div>
            ) : !currentList ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                  <FaTasks className="text-4xl text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No list selected
                </h3>
                <p className="text-gray-400 mb-6">
                  Select a list from the sidebar or create a new one to get started.
                </p>
                <button
                  onClick={() => showListModal()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 transform hover:scale-105"
                >
                  <FaPlus className="mr-2" /> Create New List
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg text-white">
                      {currentList.title || currentList.name}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {pendingTasks} of {(currentList.tasks || []).length} tasks remaining
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                      onClick={() => showListModal(currentList._id)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="p-2 text-white/80 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      onClick={() =>
                        showDeleteConfirmation(
                          "Are you sure you want to delete this list and all its tasks?",
                          () => deleteList(currentList._id)
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Add Task button */}
                <div className="p-6 border-b border-gray-700/50">
                  <button
                    onClick={() => {
                      setCurrentTask(null);
                      setShowTaskModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <FaPlus className="mr-2" /> Add New Task
                  </button>
                </div>

                <div className="h-96 overflow-y-auto p-4">
                  {loading && (currentList.tasks || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading tasks...</p>
                    </div>
                  ) : (currentList.tasks || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaTasks className="text-2xl text-gray-500" />
                      </div>
                      <p>No tasks in this list yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(currentList.tasks || []).map((task, index) => {
                        const taskKey = task._id || `task-${index}`;
                        
                        return (
                          <div
                            key={taskKey}
                            className="group bg-gray-700/30 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200"
                          >
                            <div className="flex items-center">
                              <button
                                className={`mr-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  task.completed
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-gray-500 hover:border-green-500"
                                }`}
                                onClick={() => toggleTaskComplete(task._id)}
                                title={
                                  task.completed
                                    ? "Mark as pending"
                                    : "Mark as complete"
                                }
                              >
                                {task.completed && <FaCheck className="text-xs" />}
                              </button>
                              
                              <div
                                className={`flex-1 ${
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-200"
                                }`}
                              >
                                {task.text}
                              </div>
                              
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setCurrentTask(task);
                                    setShowTaskModal(true);
                                  }}
                                  title="Edit"
                                >
                                  <FaPen className="text-xs" />
                                </button>
                                <button
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                  onClick={() =>
                                    showDeleteConfirmation(
                                      "Are you sure you want to delete this task?",
                                      () => deleteTask(task._id)
                                    )
                                  }
                                  title="Delete"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        currentTask={currentTask}
      />

      {/* Dark Theme Modals */}
      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">Create New List</h3>
              <button
                onClick={() => setShowNewListModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={createNewList} className="space-y-6">
                <div>
                  <label
                    htmlFor="listName"
                    className="block text-gray-300 mb-3 font-medium"
                  >
                    List Name
                  </label>
                  <input
                    type="text"
                    id="listName"
                    value={modalData.listName}
                    onChange={(e) =>
                      setModalData({ ...modalData, listName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter list name..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewListModal(false)}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create List"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {showEditListModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">Edit List</h3>
              <button
                onClick={() => setShowEditListModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={updateList} className="space-y-6">
                <div>
                  <label
                    htmlFor="editListName"
                    className="block text-gray-300 mb-3 font-medium"
                  >
                    List Name
                  </label>
                  <input
                    type="text"
                    id="editListName"
                    value={modalData.listName}
                    onChange={(e) =>
                      setModalData({ ...modalData, listName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter list name..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditListModal(false)}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-white">Confirm Action</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <p className="mb-6 text-gray-300">{modalData.confirmMessage}</p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    modalData.confirmAction();
                    setShowConfirmModal(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 backdrop-blur-sm border border-red-500/30 text-red-200 p-4 rounded-xl shadow-2xl max-w-md z-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaTimes className="text-red-400 mr-3" />
            </div>
            <div className="flex-1">
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-400 hover:text-red-300 p-1 rounded transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
