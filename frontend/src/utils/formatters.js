// Format date to readable string
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return d.toLocaleDateString('en-US', options);
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(date);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format role name
export const formatRole = (role) => {
    if (!role) return '';
    return capitalize(role);
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Format task status
export const formatTaskStatus = (status) => {
    if (!status) return '';

    const statusMap = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'done': 'Done',
    };

    return statusMap[status] || capitalize(status);
};

// Get status color
export const getStatusColor = (status) => {
    const colorMap = {
        'todo': 'neutral',
        'in-progress': 'warning',
        'done': 'success',
    };

    return colorMap[status] || 'neutral';
};

// Get role color
export const getRoleColor = (role) => {
    const colorMap = {
        'admin': 'error',
        'manager': 'secondary',
        'user': 'primary',
    };

    return colorMap[role] || 'neutral';
};
