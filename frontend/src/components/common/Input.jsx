const Input = ({
    label,
    error,
    helper,
    type = 'text',
    className = '',
    required = false,
    ...props
}) => {
    const inputClasses = `input ${error ? 'input-error' : ''} ${className}`;

    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={inputClasses}
                {...props}
            />

            {error && <p className="form-error">{error}</p>}
            {helper && !error && <p className="form-helper">{helper}</p>}
        </div>
    );
};

export default Input;
