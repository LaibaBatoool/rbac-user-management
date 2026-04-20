import api from '../config/api';

export const getAllTasks = () => {
    return api.get('/tasks');
};

export const getTasksByProject = (projectId) => {
    return api.get(`/tasks/project/${projectId}`);
};

export const createTask = (taskData) => {
    return api.post('/tasks', taskData);
};

export const updateTask = (taskId, taskData) => {
    return api.put(`/tasks/${taskId}`, taskData);
};

export const updateTaskStatus = (taskId, status) => {
    return api.put(`/tasks/${taskId}/status`, { status });
};

export const assignTask = (taskId, userId) => {
    return api.put(`/tasks/${taskId}/assign`, { userId });
};

export const deleteTask = (taskId) => {
    return api.delete(`/tasks/${taskId}`);
};
