// src/pages/LoginPage.jsx
import React from "react";
import AuthForm from "../components/AuthForm";

const LoginPage = ({ onAuthSuccess }) => {
  return <AuthForm onAuthSuccess={onAuthSuccess} />;
};

export default LoginPage;
