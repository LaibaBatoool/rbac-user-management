import api from '../config/api';

export const getAllUsers = () => {
    return api.get('/users');
};

export const getUserById = (userId) => {
    return api.get(`/users/${userId}`);
};

export const updateUserRole = (userId, role) => {
    return api.put(`/users/${userId}/role`, { role });
};

export const deleteUser = (userId) => {
    return api.delete(`/users/${userId}`);
};

export const getUserProfile = () => {
    return api.get('/users/profile');
};
