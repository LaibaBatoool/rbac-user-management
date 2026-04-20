const Card = ({
    children,
    title,
    subtitle,
    headerAction,
    className = '',
    ...props
}) => {
    return (
        <div className={`card ${className}`} {...props}>
            {(title || subtitle || headerAction) && (
                <div className="card-header flex items-start justify-between">
                    <div>
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}

            <div className="card-body">
                {children}
            </div>
        </div>
    );
};

export default Card;
