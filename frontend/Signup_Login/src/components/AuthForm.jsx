import React, { useState, useEffect } from 'react';
import InputGroup from './InputGroup';
import MessageDisplay from './MessageDisplay';

//  access environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthForm = ({onAuthSuccess}) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false); 
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(false);

    // Function to display messages
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setMessageActive(true);
        setTimeout(() => {
            setMessageActive(false);
            setMessage(''); // Clear message after transition
            setMessageType('');
        }, 5000); // Message disappears after 5 seconds
    };

    // Handlers for input changes
    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const handleForgotPasswordEmailChange = (e) => {
        setForgotPasswordEmail(e.target.value);
    };

    // Reset forms and messages when switching tabs
    useEffect(() => {
        setLoginForm({ email: '', password: '' });
        setSignupForm({ username: '', email: '', password: '', confirmPassword: '' });
        setForgotPasswordEmail('');
        setMessage('');
        setMessageType('');
        setMessageActive(false);
        setLoading(false); // Ensure loading is reset too
    }, [isLogin, showForgotPassword]);

    // Handle Login Submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages
        setMessageType('');

        const { email, password } = loginForm;

        // Basic client-side validation
        if (!email || !password) {
            showMessage('Please fill in all fields.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Login successful!', 'success');
                console.log('Login successful:', data);
                setLoginForm({ email: '', password: '' }); // Clear form
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.token, data.user)
            } else {
                showMessage(data.message || 'Login failed. Please try again.', 'error');
                console.error('Login error:', data);
            }
        } catch (error) {
            console.error('Network error during login:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Signup Submission
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages
        setMessageType('');

        const { username, email, password, confirmPassword } = signupForm;

        // Basic client-side validation
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields.', 'error');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            showMessage('Password must be at least 8 characters long.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Signup successful!', 'success');
                console.log('Signup successful:', data);
                setSignupForm({ username: '', email: '', password: '', confirmPassword: '' }); // Clear form
                
                setIsLogin(true);
            } else {
                showMessage(data.message || 'Signup failed. Please try again.', 'error');
                console.error('Signup error:', data);
            }
        } catch (error) {
            console.error('Network error during signup:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        if (!forgotPasswordEmail) {
            showMessage('Please enter your email address.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/forgotpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                
                showMessage('If an account with that email exists, a password reset email has been sent. Check your inbox.', 'success');
                
                
                setForgotPasswordEmail(''); // Clear email field
                setShowForgotPassword(false); // Hide forgot password form
            } else {
                
                console.error('Forgot password request error:', data);
                showMessage('If an account with that email exists, a password reset email has been sent. Check your inbox.', 'success'); // Generic success message
            }
        } catch (error) {
            console.error('Network error during forgot password:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-toggle">
                <button
                    className={isLogin && !showForgotPassword ? 'active' : ''}
                    onClick={() => { setIsLogin(true); setShowForgotPassword(false); }}
                    disabled={loading}
                >
                    Login
                </button>
                <button
                    className={!isLogin && !showForgotPassword ? 'active' : ''}
                    onClick={() => { setIsLogin(false); setShowForgotPassword(false); }}
                    disabled={loading}
                >
                    Signup
                </button>
                {showForgotPassword && (
                    <button
                        className="active" // You might want a different style for this
                        onClick={() => setShowForgotPassword(false)}
                        disabled={loading}
                    >
                        Back to Login
                    </button>
                )}
            </div>

            <MessageDisplay message={message} type={messageType} isActive={messageActive} />

            {!showForgotPassword ? (
                isLogin ? (
                    <div id="login-form" className="form-section active">
                        <h2>Login</h2>
                        <form onSubmit={handleLoginSubmit}>
                            <InputGroup
                                label="Email"
                                type="email"
                                id="login-email"
                                name="email"
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                required
                                autoComplete="email"
                            />
                            <InputGroup
                                label="Password"
                                type="password"
                                id="login-password"
                                name="password"
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                required
                                autoComplete="current-password"
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span> Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                            <div className="forgot-password-link">
                                <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div id="signup-form" className="form-section active">
                        <h2>Signup</h2>
                        <form onSubmit={handleSignupSubmit}>
                            <InputGroup
                                label="Username"
                                type="text"
                                id="signup-username"
                                name="username"
                                value={signupForm.username}
                                onChange={handleSignupChange}
                                required
                                autoComplete="username"
                            />
                            <InputGroup
                                label="Email"
                                type="email"
                                id="signup-email"
                                name="email"
                                value={signupForm.email}
                                onChange={handleSignupChange}
                                required
                                autoComplete="email"
                            />
                            <InputGroup
                                label="Password"
                                type="password"
                                id="signup-password"
                                name="password"
                                value={signupForm.password}
                                onChange={handleSignupChange}
                                required
                                autoComplete="new-password"
                            />
                            <InputGroup
                                label="Confirm Password"
                                type="password"
                                id="signup-confirm-password"
                                name="confirmPassword"
                                value={signupForm.confirmPassword}
                                onChange={handleSignupChange}
                                required
                                autoComplete="new-password"
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span> Signing up...
                                    </>
                                ) : (
                                    'Signup'
                                )}
                            </button>
                        </form>
                    </div>
                )
            ) : (
                <div id="forgot-password-form" className="form-section active">
                    <h2>Forgot Password</h2>
                    <p>Enter your email address to receive a password reset link.</p>
                    <form onSubmit={handleForgotPasswordSubmit}>
                        <InputGroup
                            label="Email"
                            type="email"
                            id="forgot-email"
                            name="email"
                            value={forgotPasswordEmail}
                            onChange={handleForgotPasswordEmailChange}
                            required
                            autoComplete="email"
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span> Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AuthForm;