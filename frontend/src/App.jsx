import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import AuthPage from "./components/Auth/AuthPage";
import TodoList from "./components/TodoApp/TodoList";
import LoadingSpinner from "./components/UI/LoadingSpinner";
// ✅ ADD: Import the new forgot password components
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "loading:",
    loading,
    "user:",
    user
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  console.log(
    "PublicRoute - isAuthenticated:",
    isAuthenticated,
    "loading:",
    loading,
    "user:",
    user
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/app" replace />;
}

function AppContent() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        {/* ✅ ADD: Forgot Password Route */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        {/* ✅ ADD: Reset Password Route */}
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <TodoList onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to appropriate page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
