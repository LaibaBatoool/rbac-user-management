import { getRoleColor } from '../../utils/formatters';

const Badge = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const variantClasses = {
        primary: 'badge-primary',
        secondary: 'badge-secondary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        neutral: 'badge-neutral',
    };

    const classes = `badge ${variantClasses[variant]} ${className}`;

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};

export default Badge;
