import React from 'react';

const InputGroup = ({ label, type, id, name, value, onChange, required, autoComplete, placeholder, error }) => {
    return (
        <div className="input-group">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className={error ? 'input-error' : ''} // Add error class for styling
            />
            {error && <span className="input-validation-error">{error}</span>}
        </div>
    );
};

export default InputGroup;