import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;

    // Store token and user data
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return { token, user };
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token
 */
export const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    getToken,
    isAuthenticated
};

export default authService;
