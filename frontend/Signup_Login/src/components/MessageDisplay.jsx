import React from 'react';

const MessageDisplay = ({ message, type, isActive }) => {
    if (!message) return null;

    return (
        <div className={`message ${type} ${isActive ? 'active' : ''}`}>
            {message}
        </div>
    );
};

export default MessageDisplay;