const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={classes}
            {...props}
        >
            {loading && <span className="spinner" />}
            {children}
        </button>
    );
};

export default Button;
