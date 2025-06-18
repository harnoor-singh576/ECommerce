import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import ResetPassword from './components/ResetPassword';
import './index.css'; // Import global styles
// import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>         
          <Route path="/login" element={<AuthForm />} />
          <Route path="/signup" element={<AuthForm />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />          
        </Routes>
      </div>
    </Router>
  );
}

export default App;