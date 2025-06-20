// src/components/ForgotPasswordRequest.jsx
import React, { useState } from "react";
import InputGroup from "./InputGroup";
import MessageDisplay from "./MessageDisplay";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setMessageActive(true);
    setTimeout(() => {
      setMessageActive(false);
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!email) {
      showMessage("Please enter your email address.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          data.message ||
            "If a user with that email exists, a password reset link has been sent to your inbox.",
          "success"
        );
        setEmail(""); // Clear email field
      } else {
        // Backend sends 200 even if email not found to prevent enumeration,
        // so this else block might only catch true server errors or bad requests.
        showMessage(
          data.message ||
            "Failed to send password reset email. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Network error during forgot password request:", error);
      showMessage(
        "Network error. Please check your connection or server status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-section active">
        <h2>Forgot Password?</h2>
        <p>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        <MessageDisplay
          message={message}
          type={messageType}
          isActive={messageActive}
        />
        <form onSubmit={handleSubmit}>
          <InputGroup
            label="Email Address"
            type="email"
            id="forgot-email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span> Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
          <p style={{ marginTop: "15px" }}>
            Remember your password? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordRequest;
