import React, { useState, useEffect } from "react";
import InputGroup from "./InputGroup";
import MessageDisplay from "./MessageDisplay";
import { Link, useNavigate } from "react-router-dom";

//  access environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", mfaToken: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // MFA states
  const [mfaRequiredForLogin, setMfaRequiredForLogin] = useState(false); // To show MFA input during login
  const [mfaSetupInitiated, setMfaSetupInitiated] = useState(false); // To show QR code/input for MFA setup
  const [qrCodeURL , setqrCodeURL ] = useState("");
  const [mfaSecret, setMfaSecret] = useState(""); // In case user needs to manually enter secret
  const [currentAuthToken, setCurrentAuthToken] = useState(null); // Store token temporarily for MFA setup calls
  const navigate = useNavigate(); // Hook for navigation 


  // Function to display messages
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setMessageActive(true);
    setTimeout(() => {
      setMessageActive(false);
      setMessage(""); // Clear message after transition
      setMessageType("");
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
    setLoginForm({ email: "", password: "", mfaToken: "" });
    setSignupForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setForgotPasswordEmail("");
    setMessage("");
    setMessageType("");
    setMessageActive(false);
    setLoading(false); // Ensure loading is reset too
    setMfaRequiredForLogin(false); // Reset MFA login state
    setMfaSetupInitiated(false); // Reset MFA setup state
    setqrCodeURL ("");
    setMfaSecret("");
    setCurrentAuthToken(null);
  }, [isLogin, showForgotPassword]);

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    setMessageType("");

    const { email, password, mfaToken } = loginForm;

    // Basic client-side validation
    if (!mfaRequiredForLogin && !email || !password) {
      showMessage("Please fill in all fields.", "error");
      setLoading(false);
      return;
    }

    if (mfaRequiredForLogin && !mfaToken) {
      showMessage("Please enter your MFA token.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, ...(mfaRequiredForLogin && { mfaToken })}),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.mfaRequired) {
          // Backend signaled MFA is required
          setMfaRequiredForLogin(true);
          showMessage(data.message, "info");
        }else{showMessage(data.message || "Login successful!", "success");
        console.log("Login successful:", data);
        setLoginForm({ email: "", password: "" }); // Clear form

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
        setMfaRequiredForLogin(false); // Reset MFA login state
      }
        
      } else {
        showMessage(data.message || "Login failed. Please try again.", "error");
        console.error("Login error:", data);
        if (data.message && data.message.includes("MFA token")) {
          // If the failure was specifically due to an invalid MFA token,
          // keep the MFA input visible for another attempt.
          setMfaRequiredForLogin(true);
        } else {
          // For other errors, reset the MFA requirement
          setMfaRequiredForLogin(false);
        }
      }
    } catch (error) {
      console.error("Network error during login:", error);
      showMessage(
        "Network error. Please check your connection or server status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    setMessageType("");

    const { username, email, password, confirmPassword } = signupForm;

    // Basic client-side validation
    if (!username || !email || !password || !confirmPassword) {
      showMessage("Please fill in all fields.", "error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      showMessage("Password must be at least 8 characters long.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Signup successful!", "success");
        console.log("Signup successful:", data);
        setSignupForm({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }); // Clear form

        setIsLogin(true);
      } else {
        showMessage(
          data.message || "Signup failed. Please try again.",
          "error"
        );
        console.error("Signup error:", data);
      }
    } catch (error) {
      console.error("Network error during signup:", error);
      showMessage(
        "Network error. Please check your connection or server status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!forgotPasswordEmail) {
      showMessage("Please enter your email address.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forgotpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          "If an account with that email exists, a password reset email has been sent. Check your inbox.",
          "success"
        );

        setForgotPasswordEmail(""); // Clear email field
        setShowForgotPassword(false); // Hide forgot password form
      } else {
        console.error("Forgot password request error:", data);
        showMessage(
          "If an account with that email exists, a password reset email has been sent. Check your inbox.",
          "success"
        ); // Generic success message
      }
    } catch (error) {
      console.error("Network error during forgot password:", error);
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // MFA initiate setup function

  const handleInitiateMfaSetup = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");
    const token = localStorage.getItem("token"); // Get token from local storage

    if (!token) {
      showMessage("You need to be logged in to set up MFA.", "error");
      setLoading(false);
      navigate("/login"); // Redirect to login
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mfa/setup-init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setqrCodeURL (data.qrCodeURL);
        setMfaSecret(data.secret);
        setMfaSetupInitiated(true);
        setCurrentAuthToken(token); // Store the token for the next step
        showMessage(data.message, "info");
      } else {
        showMessage(data.message || "Failed to initiate MFA setup.", "error");
      }
    } catch (error) {
      console.error("Network error during MFA setup initiation:", error);
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handles MFA Complete setup logic function
  const handleCompleteMfaSetup = async (mfaCode) => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!mfaCode) {
      showMessage("Please enter the 6-digit code from your authenticator app.", "error");
      setLoading(false);
      return;
    }

    const token = currentAuthToken || localStorage.getItem("token"); // Use the token from initiation or fresh from storage

    if (!token) {
      showMessage("Authentication token missing. Please log in again.", "error");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mfa/setup-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: mfaCode }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "MFA successfully enabled!", "success");
        setMfaSetupInitiated(false); // Hide MFA setup UI
        setqrCodeURL ("");
        setMfaSecret("");
        setCurrentAuthToken(null);

        // Update user status in local storage/context after MFA enabled
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.mfaEnabled = true;
          localStorage.setItem("user", JSON.stringify(user));
          onAuthSuccess(token, user); // Re-trigger onAuthSuccess to update context if needed
        }
      } else {
        showMessage(data.message || "Failed to enable MFA. Invalid code.", "error");
      }
    } catch (error) {
      console.error("Network error during MFA setup completion:", error);
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handles MFA disable logic function
  const handleDisableMfa = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("You need to be logged in to disable MFA.", "error");
      setLoading(false);
      navigate("/login");
      return;
    }

    
    try {
      const response = await fetch(`${API_BASE_URL}/mfa/disable`, {
        method: "POST", // Using POST for state change, even if it's "disable"
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "MFA successfully disabled.", "success");
        // Update user status in local storage/context after MFA disabled
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.mfaEnabled = false;
          localStorage.setItem("user", JSON.stringify(user));
          onAuthSuccess(token, user); // Re-trigger onAuthSuccess
        }
      } else {
        showMessage(data.message || "Failed to disable MFA.", "error");
      }
    } catch (error) {
      console.error("Network error during MFA disable:", error);
      showMessage("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const [mfaCodeInput, setMfaCodeInput] = useState("");
  const handleMfaCodeInputChange = (e) => {
    setMfaCodeInput(e.target.value);
  };
 // Determine if MFA is enabled for the currently logged-in user
  const loggedInUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const isMfaEnabledForLoggedInUser = loggedInUser && loggedInUser.mfaEnabled;


  return (
    <div className="container">
      <div className="form-toggle">
        <button
          className={isLogin && !showForgotPassword && !mfaSetupInitiated ? "active" : ""}
          onClick={() => {
            setIsLogin(true);
            setShowForgotPassword(false);
            setMfaSetupInitiated(false);
            setMfaRequiredForLogin(false);
          }}
          disabled={loading}
        >
          Login
        </button>
        <button
          className={!isLogin && !showForgotPassword && !mfaSetupInitiated ? "active" : ""}
          onClick={() => {
            setIsLogin(false);
            setShowForgotPassword(false);
            setMfaSetupInitiated(false);
            setMfaRequiredForLogin(false);
          }}
          disabled={loading}
        >
          Signup
        </button>

        {loggedInUser && ( // Only show MFA management if user is logged in
          <button
            className={mfaSetupInitiated ? "active" : ""}
            onClick={() => {
              setIsLogin(false); 
              setShowForgotPassword(false);
              setMfaSetupInitiated(true); // Show MFA setup/manage section
              setMfaRequiredForLogin(false);
            }}
            disabled={loading}
          >
            Manage MFA
          </button>
        )}
        {showForgotPassword && (
          <button
            className="active" 
            onClick={() => setShowForgotPassword(false)}
            disabled={loading}
          >
            Back to Login
          </button>
        )}
      </div>

      <MessageDisplay
        message={message}
        type={messageType}
        isActive={messageActive}
      />

      {mfaSetupInitiated && loggedInUser ? (
        // MFA Setup / Management Section
        <div id="mfa-management-form" className="form-section active">
          <h2>Multi-Factor Authentication</h2>
          {!isMfaEnabledForLoggedInUser ? (
            <div>
              {qrCodeURL  ? (
                <>
                  <p>Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                  <img src={qrCodeURL } alt="MFA QR Code" style={{ width: '200px', height: '200px', margin: '20px auto', display: 'block' }} />
                  <p>Or manually enter the secret: <strong>{mfaSecret}</strong></p>
                  <form onSubmit={(e) => { e.preventDefault(); handleCompleteMfaSetup(mfaCodeInput); }}>
                    <InputGroup
                      label="Enter Code from App"
                      type="text"
                      id="mfa-setup-code"
                      name="mfaCode"
                      value={mfaCodeInput}
                      onChange={handleMfaCodeInputChange}
                      required
                      pattern="\d{6}" // Ensure 6 digits
                      maxLength="6"
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span> Verifying...
                        </>
                      ) : (
                        "Verify & Enable MFA"
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <button onClick={handleInitiateMfaSetup} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span> Generating...
                    </>
                  ) : (
                    "Initiate MFA Setup"
                  )}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p>MFA is currently **enabled** for your account.</p>
              <button onClick={handleDisableMfa} disabled={loading} style={{ backgroundColor: 'darkred' }}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span> Disabling...
                  </>
                ) : (
                  "Disable MFA"
                )}
              </button>
            </div>
          )}
        </div>
      ) : !showForgotPassword ? (
        isLogin ? (
          // Login Form
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
                disabled={mfaRequiredForLogin && !loading} // Disable email/pass if MFA is required
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
                disabled={mfaRequiredForLogin && !loading} // Disable email/pass if MFA is required
              />
              {mfaRequiredForLogin && ( // Conditionally render MFA token input
                <InputGroup
                  label="MFA Code"
                  type="text"
                  id="mfa-login-code"
                  name="mfaToken"
                  value={loginForm.mfaToken}
                  onChange={handleLoginChange}
                  required
                  pattern="\d{6}" // Ensure 6 digits
                  maxLength="6"
                  autoComplete="one-time-code"
                />
              )}
              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>{" "}
                    {mfaRequiredForLogin ? "Verifying MFA..." : "Logging in..."}
                  </>
                ) : mfaRequiredForLogin ? (
                  "Verify MFA & Login"
                ) : (
                  "Login"
                )}
              </button>
              {!mfaRequiredForLogin && ( // Hide forgot password link if MFA is pending
                <div className="forgot-password-link">
                  <a href="#" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                  </a>
                </div>
              )}
            </form>
          </div>
        ) : (
          // Signup Form
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
                  "Signup"
                )}
              </button>
            </form>
          </div>
        )
      ) : (
        // Forgot Password Form
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
                "Send Reset Link"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
