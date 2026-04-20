import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProjects, createProject } from '../services/projectService';
import { getAllTasks, createTask } from '../services/taskService';
import { getAllUsers } from '../services/userService';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/Spinner';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);
    const [users, setUsers] = useState([]);

    // Modal states
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [projectForm, setProjectForm] = useState({ title: '', description: '' });
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: null,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [projectsRes, tasksRes, usersRes] = await Promise.all([
                getMyProjects(),
                getAllTasks().catch(() => ({ data: [] })),
                getAllUsers().catch(() => ({ data: [] })),
            ]);

            const projects = projectsRes.data || [];
            const tasks = tasksRes.data || [];
            const allUsers = usersRes.data || [];

            setStats({
                totalProjects: projects.length,
                activeTasks: tasks.filter(t => t.status !== 'done').length,
                completedTasks: tasks.filter(t => t.status === 'done').length,
                teamMembers: allUsers.length,
            });

            setRecentProjects(projects.slice(0, 5));
            setRecentTasks(tasks.slice(0, 5));
            setUsers(allUsers);
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectForm.title.trim()) {
            toast.error('Project title is required');
            return;
        }

        setSubmitting(true);
        try {
            await createProject(projectForm);
            toast.success('Project created successfully!');
            setShowProjectModal(false);
            setProjectForm({ title: '', description: '' });
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) {
            toast.error('Task title is required');
            return;
        }
        if (!taskForm.project) {
            toast.error('Please select a project');
            return;
        }

        setSubmitting(true);
        try {
            await createTask({
                ...taskForm,
                assignedTo: taskForm.assignedTo || undefined,
            });
            toast.success('Task created successfully!');
            setShowTaskModal(false);
            setTaskForm({
                title: '',
                description: '',
                project: '',
                assignedTo: '',
                priority: 'medium',
                dueDate: null,
            });
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    const statCards = [
        {
            name: 'Total Projects',
            value: stats.totalProjects,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600',
            show: true,
        },
        {
            name: 'Active Tasks',
            value: stats.activeTasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'from-purple-500 to-purple-600',
            show: true,
        },
        {
            name: 'Completed',
            value: stats.completedTasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-green-500 to-green-600',
            show: true,
        },
        {
            name: 'Team Members',
            value: stats.teamMembers,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'from-amber-500 to-amber-600',
            show: hasPermission(user?.role, PERMISSIONS.VIEW_USERS),
        },
    ];

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-blue-100">Here's what's happening with your projects today</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.filter(s => s.show).map((stat) => (
                    <Card key={stat.name} className="relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`} />
                        <div className="relative">
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}>
                                {stat.icon}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowProjectModal(true)}
                            className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                        >
                            <div className="text-3xl">📁</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Create Project</h3>
                                <p className="text-sm text-gray-600">Start a new project</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                        >
                            <div className="text-3xl">✓</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Create Task</h3>
                                <p className="text-sm text-gray-600">Add a new task</p>
                            </div>
                        </button>
                    </div>
                </Card>
            )}

            {/* Recent Projects & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h2>
                    {recentProjects.length > 0 ? (
                        <div className="space-y-3">
                            {recentProjects.map((project) => (
                                <div
                                    key={project._id}
                                    onClick={() => navigate(`/projects/${project._id}/tasks`)}
                                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                >
                                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No projects yet</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
                    {recentTasks.length > 0 ? (
                        <div className="space-y-3">
                            {recentTasks.map((task) => (
                                <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                                        <Badge variant={task.status === 'done' ? 'success' : 'warning'}>
                                            {task.status}
                                        </Badge>
                                    </div>
                                    {task.project && (
                                        <p className="text-xs text-gray-500 mt-1">📁 {task.project.title}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No tasks yet</p>
                    )}
                </Card>
            </div>

            {/* Create Project Modal */}
            <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title="Create New Project">
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <Input
                        label="Project Title"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        required
                        placeholder="Enter project title"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Project description (optional)"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowProjectModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                            Create Project
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Create Task Modal */}
            <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input
                        label="Task Title"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        required
                        placeholder="Enter task title"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Task description (optional)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                        <select
                            value={taskForm.project}
                            onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a project</option>
                            {recentProjects.map(p => (
                                <option key={p._id} value={p._id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            value={taskForm.assignedTo}
                            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={taskForm.priority}
                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <DatePicker
                            selected={taskForm.dueDate}
                            onChange={(date) => setTaskForm({ ...taskForm, dueDate: date })}
                            minDate={new Date()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholderText="Select due date (optional)"
                            dateFormat="MMM d, yyyy"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                            Create Task
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
