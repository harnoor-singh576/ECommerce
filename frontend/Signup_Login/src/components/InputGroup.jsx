import React, { useState } from "react";
import "../index.css";

const InputGroup = ({
  label,
  type,
  id,
  name,
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={error ? "input-error" : ""}
        />
        {type === "password" && (
          <span
            className="password-toggle-icon"
            onClick={togglePasswordVisibility}
            style={{
              cursor: "pointer",
              marginLeft: "-30px",
              position: "relative",
              zIndex: 1,
            }} // Basic inline style, consider a CSS class
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash"></i> // FontAwesome eye-slash icon
            ) : (
              <i className="fa-solid fa-eye"></i> // FontAwesome eye icon
            )}
          </span>
        )}
      </div>

      {error && <span className="input-validation-error">{error}</span>}
    </div>
  );
};

export default InputGroup;
