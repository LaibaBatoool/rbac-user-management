const EmptyState = ({
    icon,
    title,
    message,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {icon && (
                <div className="text-6xl text-gray-300 mb-4">
                    {icon}
                </div>
            )}

            {title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {title}
                </h3>
            )}

            {message && (
                <p className="text-gray-600 mb-6 max-w-md">
                    {message}
                </p>
            )}

            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
