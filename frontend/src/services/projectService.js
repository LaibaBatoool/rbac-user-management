import api from '../config/api';

export const getMyProjects = () => {
    return api.get('/projects');
};

export const getAllProjects = () => {
    return api.get('/projects');
};

export const createProject = (projectData) => {
    return api.post('/projects', projectData);
};

export const getProjectById = (projectId) => {
    return api.get(`/projects/${projectId}`);
};

export const updateProject = (projectId, projectData) => {
    return api.put(`/projects/${projectId}`, projectData);
};

export const deleteProject = (projectId) => {
    return api.delete(`/projects/${projectId}`);
};

export const addProjectMember = (projectId, userId) => {
    return api.put(`/projects/${projectId}/members`, { userId });
};

export const removeProjectMember = (projectId, userId) => {
    return api.delete(`/projects/${projectId}/members/${userId}`);
};
