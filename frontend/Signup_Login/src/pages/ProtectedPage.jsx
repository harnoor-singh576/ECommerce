// src/pages/ProtectedPage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ProtectedPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <h2>Welcome to your Protected Page!</h2>
      {user ? (
        <div className="user-info">
          <p>Hello, {user.username}!</p>
          <p>Your email: {user.email}</p>
          {user.profilePicture && (
             <img
               src={`${import.meta.env.VITE_API_BASE_URL}/${user.profilePicture}`}
               alt="Profile"
               className="profile-picture-display"
             />
          )}
          <p>MFA Enabled: {user.mfaEnabled ? "Yes" : "No"}</p>
          <div className="button-group">
            <Link to="/profile" className="button">Update Profile</Link>
            <button onClick={logout} className="button logout-button">Logout</button>
          </div>
        </div>
      ) : (
        <p>You are not logged in. Please <Link to="/login">login</Link> to access this page.</p>
      )}
    </div>
  );
};

export default ProtectedPage;
