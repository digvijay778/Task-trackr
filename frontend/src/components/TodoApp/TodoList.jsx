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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">Task Trackr</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => showListModal()}
              className="bg-olive-600 hover:bg-olive-700 px-4 py-2 rounded-lg flex items-center transition-colors text-olive-600 hover:text-olive-800 font-medium"
            >
              <FaPlus className="mr-2" /> New List
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-olive-600"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
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
          <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-olive-800 text-olive-600 px-4 py-3 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-olive-600">
                Your Lists
              </h2>
              <span className="bg-olive-600 text-xs px-2 py-1 rounded-full">
                {(state.lists || []).length}
              </span>
            </div>
            <div className="h-96 overflow-y-auto p-2">
              {loading && (state.lists || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading your lists...</p>
                </div>
              ) : (state.lists || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FaList className="w-16 h-16 mx-auto mb-2 opacity-30" />
                  <p>No lists yet. Create one!</p>
                </div>
              ) : (
                (state.lists || []).map((list, index) => {
                  const listKey = list._id || `list-${index}`;
                  const listPendingTasks = (list.tasks || []).filter(
                    (task) => !task.completed
                  ).length;
                  const isActive = state.currentListId === list._id;

                  return (
                    <div
                      key={listKey}
                      className={`list-item mb-2 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? "bg-olive-100 border-l-4 border-olive-600"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => updateState({ currentListId: list._id })}
                    >
                      <div className="flex justify-between items-center p-3">
                        <div className="flex items-center">
                          <img
                            src={`https://img.icons8.com/ios-filled/24/${
                              listPendingTasks > 0 ? "6e7f41" : "a3a3a3"
                            }/list.png`}
                            alt="List"
                            className="w-5 h-5 mr-3"
                          />
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {list.title || list.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {listPendingTasks} pending task
                              {listPendingTasks !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="list-actions opacity-0 flex space-x-1 transition-opacity">
                          <button
                            className="edit-list p-1 text-gray-400 hover:text-olive-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              showListModal(list._id);
                            }}
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            className="delete-list p-1 text-gray-400 hover:text-red-600"
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
                })
              )}
            </div>
          </div>

          {/* Tasks Main Area */}
          <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-md overflow-hidden">
            {loading && !currentList ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                <div className="animate-spin w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full mb-4"></div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Loading your tasks...
                </h3>
              </div>
            ) : !currentList ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                <img
                  src="https://img.icons8.com/fluency/96/000000/task-completed.png"
                  alt="Empty"
                  className="w-24 h-24 mb-4 opacity-50"
                />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No list selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a list from the sidebar or create a new one to get
                  started.
                </p>
                <button
                  onClick={() => showListModal()}
                  className="bg-olive-600 hover:bg-olive-700 text-olive-600 px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <FaPlus className="mr-2" /> Create New List
                </button>
              </div>
            ) : (
              <>
                <div className="bg-olive-800 text-olive-600 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {currentList.title || currentList.name}
                    </h2>
                    <p className="text-xs opacity-80">
                      {pendingTasks} of {(currentList.tasks || []).length} task
                      {(currentList.tasks || []).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-olive-200 hover:text-text-olive-600 transition-colors"
                      onClick={() =>
                        showDeleteConfirmation(
                          "Are you sure you want to delete this list and all its tasks?",
                          () => deleteList(currentList._id)
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="p-2 text-olive-200 hover:text-text-olive-600 transition-colors"
                      onClick={() => showListModal(currentList._id)}
                    >
                      <FaPen />
                    </button>
                  </div>
                </div>

                {/* Add Task button */}
                <div className="p-4 border-b">
                  <button
                    onClick={() => {
                      setCurrentTask(null);
                      setShowTaskModal(true);
                    }}
                    className="w-full bg-olive-600 hover:bg-olive-700 text-black py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <FaPlus className="mr-2" /> Add New Task
                  </button>
                </div>

                <div className="h-96 overflow-y-auto p-2">
                  {loading && (currentList.tasks || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <div className="animate-spin w-8 h-8 border-4 border-olive-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading tasks...</p>
                    </div>
                  ) : (currentList.tasks || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <img
                        src="https://img.icons8.com/fluency/96/000000/task-completed.png"
                        alt="Empty"
                        className="w-16 h-16 mx-auto mb-2 opacity-30"
                      />
                      <p>No tasks in this list yet.</p>
                    </div>
                  ) : (
                    (currentList.tasks || []).map((task, index) => {
                      const taskKey = task._id || `task-${index}`;
                      
                      return (
                        <div
                          key={taskKey}
                          className="task-item animate-fade-in mb-2 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center">
                            <button
                              className={`toggle-complete mr-3 w-6 h-6 rounded-full border-2 ${
                                task.completed
                                  ? "border-olive-600 bg-olive-600 text-white"
                                  : "border-gray-300"
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
                                  ? "line-through text-gray-400"
                                  : "text-gray-700"
                              }`}
                            >
                              {task.text}
                            </div>
                            <div className="task-actions opacity-0 flex space-x-2 transition-opacity">
                              <button
                                className="p-1 text-gray-400 hover:text-olive-600"
                                onClick={() => {
                                  setCurrentTask(task);
                                  setShowTaskModal(true);
                                }}
                                title="Edit"
                              >
                                <FaPen className="text-xs" />
                              </button>
                              <button
                                className="delete-task p-1 text-gray-400 hover:text-red-600"
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
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keep all your existing modals exactly the same */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        currentTask={currentTask}
      />

      {/* All your existing modals remain unchanged */}
      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-olive-800 text-olive-600 px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-lg">Create New List</h3>
              <button
                onClick={() => setShowNewListModal(false)}
                className="text-olive-600 hover:text-olive-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={createNewList}>
                <div className="mb-4">
                  <label
                    htmlFor="listName"
                    className="block text-gray-700 mb-2 font-medium"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                    placeholder="Enter list name..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewListModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-olive-800 text-black px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-lg">Edit List</h3>
              <button
                onClick={() => setShowEditListModal(false)}
                className="text-white hover:text-olive-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={updateList}>
                <div className="mb-4">
                  <label
                    htmlFor="editListName"
                    className="block text-gray-700 mb-2 font-medium"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                    placeholder="Enter list name..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditListModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-olive-800 text-olive px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-lg">Confirm Action</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-white hover:text-olive-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-6 text-gray-700">{modalData.confirmMessage}</p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    modalData.confirmAction();
                    setShowConfirmModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-olive-600 rounded-lg hover:bg-gray-100 transition-colors"
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
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md max-w-md">
          <div className="flex items-center">
            <div className="py-1">
              <FaTimes className="text-red-500 mr-3" />
            </div>
            <div className="flex-1">
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
