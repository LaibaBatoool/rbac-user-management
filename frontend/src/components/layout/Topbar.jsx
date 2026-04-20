import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatRole } from '../../utils/formatters';
import Badge from '../common/Badge';
import { getRoleColor } from '../../utils/formatters';

const Topbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Page Title */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your projects and tasks efficiently
                    </p>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    <Badge variant={getRoleColor(user?.role)}>
                        {formatRole(user?.role)}
                    </Badge>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
