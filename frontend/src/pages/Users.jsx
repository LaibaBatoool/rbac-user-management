import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../services/userService';
import { formatDate, formatRole, getRoleColor } from '../utils/formatters';
import { ROLES } from '../utils/permissions';
import { toast } from 'react-toastify';

// Components
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/Spinner';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsModalOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        setSubmitting(true);

        try {
            await updateUserRole(selectedUser._id, newRole);
            setUsers(users.map(u =>
                u._id === selectedUser._id ? { ...u, role: newRole } : u
            ));
            toast.success(`User role updated to ${formatRole(newRole)}`);
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error('Failed to update user role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading users..." />;
    }

    // Group users by role
    const usersByRole = {
        admin: users.filter(u => u.role === ROLES.ADMIN),
        manager: users.filter(u => u.role === ROLES.MANAGER),
        user: users.filter(u => u.role === ROLES.USER),
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-600 text-sm font-medium">Admins</h3>
                        <Badge variant="error">{usersByRole.admin.length}</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{usersByRole.admin.length}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-600 text-sm font-medium">Managers</h3>
                        <Badge variant="secondary">{usersByRole.manager.length}</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{usersByRole.manager.length}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-600 text-sm font-medium">Users</h3>
                        <Badge variant="primary">{usersByRole.user.length}</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{usersByRole.user.length}</p>
                </div>
            </div>

            {/* Users Table */}
            <Card title="All Users" subtitle="Manage user roles and permissions">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                                    <td className="py-4 px-4">
                                        <Badge variant={getRoleColor(user.role)}>
                                            {formatRole(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 text-sm">{formatDate(user.createdAt)}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenRoleModal(user)}
                                            >
                                                Change Role
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Change Role Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                title="Change User Role"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedUser(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateRole}
                            loading={submitting}
                            disabled={submitting || newRole === selectedUser?.role}
                        >
                            {submitting ? 'Updating...' : 'Update Role'}
                        </Button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {selectedUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select New Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="input"
                            >
                                <option value={ROLES.USER}>User - Can view and update assigned tasks</option>
                                <option value={ROLES.MANAGER}>Manager - Can create projects and tasks</option>
                                <option value={ROLES.ADMIN}>Admin - Full access to all features</option>
                            </select>
                        </div>

                        <div className="alert alert-warning">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">Changing a user's role will immediately affect their permissions and access to features.</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Users;
