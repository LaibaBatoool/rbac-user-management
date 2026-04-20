import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTasks } from '../services/taskService';
import { formatDate, formatTaskStatus, getStatusColor } from '../utils/formatters';
import { toast } from 'react-toastify';

// Components
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/Spinner';
import Button from '../components/common/Button';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, my-tasks, todo, in-progress, done

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getAllTasks();
            setTasks(res.data);
        } catch (error) {
            toast.error('Failed to load tasks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === 'my-tasks') {
            return task.assignedTo?._id === user._id;
        }
        if (filter === 'todo' || filter === 'in-progress' || filter === 'done') {
            return task.status === filter;
        }
        return true; // 'all'
    });

    if (loading) {
        return <LoadingSpinner message="Loading tasks..." />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
                    <p className="text-gray-600 mt-1">View and manage tasks across all projects</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    All Tasks ({tasks.length})
                </button>
                <button
                    onClick={() => setFilter('my-tasks')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'my-tasks'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    My Tasks ({tasks.filter(t => t.assignedTo?._id === user._id).length})
                </button>
                <button
                    onClick={() => setFilter('todo')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'todo'
                            ? 'bg-gray-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    To Do ({tasks.filter(t => t.status === 'todo').length})
                </button>
                <button
                    onClick={() => setFilter('in-progress')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'in-progress'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    In Progress ({tasks.filter(t => t.status === 'in-progress').length})
                </button>
                <button
                    onClick={() => setFilter('done')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'done'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Done ({tasks.filter(t => t.status === 'done').length})
                </button>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <EmptyState
                    icon="✓"
                    title="No tasks found"
                    message={filter === 'my-tasks' ? "You don't have any assigned tasks" : "No tasks match the selected filter"}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <Card key={task._id} className="hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                        <Badge variant={getStatusColor(task.status)}>
                                            {formatTaskStatus(task.status)}
                                        </Badge>
                                    </div>

                                    <p className="text-gray-600 mb-3">{task.description}</p>

                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        {task.project && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                                <span>{task.project.title}</span>
                                            </div>
                                        )}

                                        {task.assignedTo && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    {task.assignedTo.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{task.assignedTo.name}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{formatDate(task.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {task.project && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = `/projects/${task.project._id}/tasks`}
                                    >
                                        View Project →
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tasks;
