import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // For routing
import InputGroup from './InputGroup'; // Re-use your InputGroup component
import MessageDisplay from './MessageDisplay'; // Re-use your MessageDisplay component

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
    const { token } = useParams(); // Get token from URL (e.g., /resetpassword/:token)
    const navigate = useNavigate(); // For redirecting after success

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false); 

    // Function to display messages
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setMessageActive(true);
        setTimeout(() => {
            setMessageActive(false);
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Optional: You might want to verify the token's existence/basic validity on component mount
    // For a more robust check, you could send a HEAD or GET request to the backend with the token
    // to verify if it's a known token and not expired. For simplicity, we'll let the PUT request handle it.
    useEffect(() => {
        console.log("ResetPasswordPage useEffect running. Token from URL:", token);
        if (token) {
            setTokenValid(true); // Assume valid until API tells us otherwise
        } else {
            showMessage('No reset token found in URL.', 'error');
            setTokenValid(false);
        }
    }, [token]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        if (!newPassword || !confirmNewPassword) {
            showMessage('Please enter and confirm your new password.', 'error');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessage('Passwords do not match.', 'error');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters long.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/resetpassword/${token}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Your password has been reset successfully!', 'success');
                setNewPassword('');
                setConfirmNewPassword('');
                // Redirect user to login page after a short delay
                setTimeout(() => {
                    navigate('/login'); // Assuming your login page is at /login
                }, 3000);
            } else {
                showMessage(data.message || 'Password reset failed. Invalid or expired token.', 'error');
            }
        } catch (error) {
            console.error('Network error during password reset:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="container">
                <MessageDisplay message={message} type={messageType} isActive={messageActive} />
                <p>Invalid or missing password reset link. Please request a new one.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="form-section active">
                <h2>Reset Password</h2>
                <MessageDisplay message={message} type={messageType} isActive={messageActive} />
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="New Password"
                        type="password"
                        id="new-password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <InputGroup
                        label="Confirm New Password"
                        type="password"
                        id="confirm-new-password"
                        name="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span> Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;