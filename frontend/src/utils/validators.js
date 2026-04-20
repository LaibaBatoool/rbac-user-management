// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// Name validation
export const isValidName = (name) => {
    return name && name.trim().length >= 2;
};

// Form validation for registration
export const validateRegistration = (formData) => {
    const errors = {};

    if (!isValidName(formData.name)) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!isValidPassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Form validation for login
export const validateLogin = (formData) => {
    const errors = {};

    if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Project validation
export const validateProject = (formData) => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 3) {
        errors.title = 'Project title must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Task validation
export const validateTask = (formData) => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 3) {
        errors.title = 'Task title must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 5) {
        errors.description = 'Description must be at least 5 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
