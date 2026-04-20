import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Debug logging
    console.log('=== SIDEBAR DEBUG ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User role:', user?.role);
    console.log('User role type:', typeof user?.role);
    console.log('====================');

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Simplified nav items - show based on role directly
    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            show: true, // Always show
        },
        {
            name: 'Projects',
            path: '/projects',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
            show: user?.role === 'admin' || user?.role === 'manager',
        },
        {
            name: 'Tasks',
            path: '/tasks',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            show: true, // Everyone can see tasks
        },
        {
            name: 'Users',
            path: '/users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            show: user?.role === 'admin',
        },
    ];

    const visibleItems = navItems.filter(item => item.show);
    console.log('Visible nav items:', visibleItems.map(i => i.name));

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">TaskManager</h1>
                        <p className="text-xs text-gray-500">RBAC System</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {visibleItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive(item.path)
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
            `}
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'No role'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
