// Role-based permission mappings
export const PERMISSIONS = {
    // Project permissions
    CREATE_PROJECT: ['admin', 'manager'],
    UPDATE_PROJECT: ['admin', 'manager'],
    DELETE_PROJECT: ['admin'],
    VIEW_PROJECTS: ['admin', 'manager', 'user'],

    // Task permissions
    CREATE_TASK: ['admin', 'manager'],
    UPDATE_TASK: ['admin', 'manager', 'user'],
    DELETE_TASK: ['admin'],
    VIEW_TASKS: ['admin', 'manager', 'user'],
    UPDATE_TASK_STATUS: ['admin', 'manager', 'user'],

    // User permissions
    VIEW_USERS: ['admin'],
    UPDATE_USER_ROLE: ['admin'],
    DELETE_USER: ['admin'],
};

// User roles
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
    if (!userRole || !permission) return false;
    return PERMISSIONS[permission]?.includes(userRole) ?? false;
};

// Check if user has any of the specified roles
export const hasRole = (userRole, allowedRoles = []) => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
};

// Check if user owns a resource
export const isOwner = (userId, resourceOwnerId) => {
    return userId === resourceOwnerId;
};

// Check if user can edit a resource (owner or has permission)
export const canEdit = (user, resource, permission) => {
    if (!user || !resource) return false;

    // Admin can edit everything
    if (user.role === ROLES.ADMIN) return true;

    // Check if user is owner
    if (resource.createdBy?._id === user._id || resource.createdBy === user._id) {
        return true;
    }

    // Check permission
    return hasPermission(user.role, permission);
};

// Check if user can delete a resource
export const canDelete = (user, resource, permission) => {
    if (!user || !resource) return false;

    // Only admin or owner can delete
    if (user.role === ROLES.ADMIN) return true;

    return hasPermission(user.role, permission);
};
