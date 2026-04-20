import api from '../config/api';

const API_URL = '/auth';

export const registerUser = (userData) => {
    return api.post(`${API_URL}/register`, userData);
};

export const loginUser = (userData) => {
    return api.post(`${API_URL}/login`, userData);
};

export const getUserProfile = () => {
    return api.get('/users/profile');
};
