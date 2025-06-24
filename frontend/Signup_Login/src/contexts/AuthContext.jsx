// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Attempt to load token and user from localStorage on initial render
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clear potentially corrupt data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false); // Set loading to false after attempting to load
    }
  }, []);

  // Function to update the user and token in context and localStorage
  const updateAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    updateAuth(null, null);
  };

  if (loading) {
    // You might render a loading spinner here
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, updateAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext easily
export const useAuth = () => {
  return useContext(AuthContext);
};
