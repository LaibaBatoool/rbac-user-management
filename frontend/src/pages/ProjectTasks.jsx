import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasksByProject, createTask, updateTaskStatus, deleteTask, updateTask, assignTask } from '../services/taskService';
import { getProjectById } from '../services/projectService';
import { getAllUsers } from '../services/userService';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/Spinner';

const ProjectTasks = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: null,
    });

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectRes, tasksRes, usersRes] = await Promise.all([
                getProjectById(projectId),
                getTasksByProject(projectId),
                getAllUsers().catch(() => ({ data: [] })), // Fallback if not admin
            ]);
            setProject(projectRes.data);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSubmitting(true);
        try {
            await createTask({
                ...formData,
                project: projectId,
                assignedTo: formData.assignedTo || undefined,
            });
            toast.success('Task created!');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: null });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            toast.success('Status updated!');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success('Task deleted!');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'error',
            high: 'warning',
            medium: 'info',
            low: 'success'
        };
        return colors[priority] || 'neutral';
    };

    const getStatusColor = (status) => {
        const colors = {
            'todo': 'neutral',
            'in-progress': 'warning',
            'done': 'success'
        };
        return colors[status] || 'neutral';
    };

    const groupedTasks = {
        todo: tasks.filter(t => t.status === 'todo'),
        'in-progress': tasks.filter(t => t.status === 'in-progress'),
        done: tasks.filter(t => t.status === 'done'),
    };

    if (loading) return <LoadingSpinner message="Loading tasks..." />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-2">
                        ← Back to Projects
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">{project?.title}</h1>
                    <p className="text-gray-600 mt-1">{project?.description}</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Add Task
                    </Button>
                )}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in-progress', 'done'].map((status) => (
                    <Card key={status} className="bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 capitalize">
                                {status === 'in-progress' ? 'In Progress' : status}
                            </h3>
                            <Badge variant={getStatusColor(status)}>
                                {groupedTasks[status].length}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {groupedTasks[status].map((task) => (
                                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                    )}

                                    {/* Priority & Due Date */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                            {task.priority}
                                        </Badge>
                                        {task.dueDate && (
                                            <span className="text-xs text-gray-500">
                                                📅 {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Assigned User */}
                                    {task.assignedTo && (
                                        <div className="text-xs text-gray-500 mb-3">
                                            👤 {task.assignedTo.name}
                                        </div>
                                    )}

                                    {/* Status Dropdown */}
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>

                                    {/* Delete Button */}
                                    {(user?.role === 'admin' || task.createdBy?._id === user?._id) && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(task._id)}
                                            className="w-full"
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Task Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input
                        label="Task Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Enter task title"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Task description (optional)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
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
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                            selected={formData.dueDate}
                            onChange={(date) => setFormData({ ...formData, dueDate: date })}
                            minDate={new Date()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholderText="Select due date (optional)"
                            dateFormat="MMM d, yyyy"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
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

export default ProjectTasks;
