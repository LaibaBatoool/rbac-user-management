import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectTasks from './pages/ProjectTasks';
import Tasks from './pages/Tasks';
import Users from './pages/Users';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

function App() {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="spinner w-12 h-12 text-blue-600" />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes - Wrapped in DashboardLayout */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <RoleRoute allowedRoles={['admin', 'manager']}>
                            <DashboardLayout>
                                <Projects />
                            </DashboardLayout>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/projects/:projectId/tasks"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <ProjectTasks />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <RoleRoute allowedRoles={['admin', 'manager', 'user']}>
                            <DashboardLayout>
                                <Tasks />
                            </DashboardLayout>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <RoleRoute allowedRoles={['admin']}>
                            <DashboardLayout>
                                <Users />
                            </DashboardLayout>
                        </RoleRoute>
                    }
                />

                {/* 404 Not Found */}
                <Route
                    path="*"
                    element={
                        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-8">Page not found</p>
                            <a href="/dashboard" className="btn btn-primary">
                                Go to Dashboard
                            </a>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
