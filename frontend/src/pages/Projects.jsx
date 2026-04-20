import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProjects, createProject } from '../services/projectService';
import { validateProject } from '../utils/validators';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/Spinner';

const Projects = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await getMyProjects();
            setProjects(res.data);
        } catch (error) {
            toast.error('Failed to load projects');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();

        // Validate
        const validation = validateProject(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitting(true);

        try {
            await createProject(formData);
            toast.success('Project created successfully!');
            setIsModalOpen(false);
            setFormData({ title: '', description: '' });
            setErrors({});
            fetchProjects();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create project';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewTasks = (projectId) => {
        navigate(`/projects/${projectId}/tasks`);
    };

    if (loading) {
        return <LoadingSpinner message="Loading projects..." />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-1">Manage and organize your projects</p>
                </div>

                {hasPermission(user?.role, PERMISSIONS.CREATE_PROJECT) && (
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Project
                    </Button>
                )}
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <EmptyState
                    icon="📁"
                    title="No projects yet"
                    message="Get started by creating your first project"
                    action={
                        hasPermission(user?.role, PERMISSIONS.CREATE_PROJECT) && (
                            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                                Create Your First Project
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group cursor-pointer"
                            onClick={() => handleViewTasks(project._id)}
                        >
                            {/* Project Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full backdrop-blur-sm">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-1 group-hover:underline">{project.title}</h3>
                                <p className="text-blue-100 text-sm line-clamp-2">{project.description}</p>
                            </div>

                            {/* Project Body */}
                            <div className="p-6">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatDate(project.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">60%</span>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>12 tasks</span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewTasks(project._id);
                                        }}
                                    >
                                        View Tasks →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData({ title: '', description: '' });
                    setErrors({});
                }}
                title="Create New Project"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormData({ title: '', description: '' });
                                setErrors({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateProject}
                            loading={submitting}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Project'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <Input
                        label="Project Title"
                        name="title"
                        placeholder="Enter project title"
                        value={formData.title}
                        onChange={handleChange}
                        error={errors.title}
                        required
                        autoFocus
                    />

                    <div className="form-group">
                        <label className="form-label">
                            Project Description
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            name="description"
                            placeholder="Describe your project..."
                            value={formData.description}
                            onChange={handleChange}
                            className={`input min-h-[100px] ${errors.description ? 'input-error' : ''}`}
                            required
                        />
                        {errors.description && <p className="form-error">{errors.description}</p>}
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Projects;
