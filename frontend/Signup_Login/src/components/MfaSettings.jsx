import React, { useState, useEffect } from "react";
import InputGroup from "./InputGroup"; // Re-use your InputGroup component
import MessageDisplay from "./MessageDisplay"; // Re-use your MessageDisplay component

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MfaSettings = ({ currentUser, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [mfaSetupInitiated, setMfaSetupInitiated] = useState(false);
  const [mfaQrCodeUrl, setMfaQrCodeUrl] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaSetupCode, setMfaSetupCode] = useState(""); // For entering MFA code during setup

  // Function to display messages (re-used from AuthForm)
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

  // Handler for MFA setup code input
  const handleMfaSetupCodeChange = (e) => {
    setMfaSetupCode(e.target.value);
  };

  // Initiate MFA Setup (if user wants to enable it)
  const handleInitiateMfaSetup = async () => {
    setLoading(true);
    showMessage("", ""); // Clear previous messages

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Authentication token missing. Please log in.", "error");
      setLoading(false);
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
        setMfaQrCodeUrl(data.qrCodeUrl);
        setMfaSecret(data.secret);
        setMfaSetupInitiated(true);
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

  // Complete MFA Setup (verify code and enable)
  const handleCompleteMfaSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("", ""); // Clear previous messages

    if (!mfaSetupCode) {
      showMessage("Please enter the 6-digit code from your authenticator app.", "error");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Authentication token missing. Please log in.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mfa/setup-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: mfaSetupCode }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "MFA successfully enabled!", "success");
        setMfaSetupInitiated(false); // Hide MFA setup UI
        setMfaQrCodeUrl("");
        setMfaSecret("");
        setMfaSetupCode(""); // Clear code
        // Update user status in local storage/context
        const updatedUser = { ...currentUser, mfaEnabled: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onUserUpdate(updatedUser); // Notify parent (App.jsx or Products.jsx) to update its state
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

  // Disable MFA Functionality
  const handleDisableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable Multi-Factor Authentication?")) {
      return; // User cancelled
    }

    setLoading(true);
    showMessage("", ""); // Clear previous messages

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Authentication token missing. Please log in.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mfa/disable`, {
        method: "POST", // Use POST for state change
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "MFA successfully disabled.", "success");
        // Update user status in local storage/context
        const updatedUser = { ...currentUser, mfaEnabled: false };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onUserUpdate(updatedUser); // Notify parent (App.jsx or Products.jsx)
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

  return (
    <div className="mfa-settings-container">
      <h3>Multi-Factor Authentication Settings</h3>
      <MessageDisplay message={message} type={messageType} isActive={messageActive} />

      {currentUser && currentUser.mfaEnabled ? (
        // MFA is Enabled
        <div>
          <p>Multi-Factor Authentication is currently **ENABLED** for your account.</p>
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
      ) : (
        // MFA is Not Enabled
        <div>
          <p>Multi-Factor Authentication is currently **DISABLED** for your account.</p>
          {!mfaSetupInitiated ? (
            <button onClick={handleInitiateMfaSetup} disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span> Initiating...
                </>
              ) : (
                "Enable MFA"
              )}
            </button>
          ) : (
            <>
              {mfaQrCodeUrl && (
                <>
                  <p>Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                  <img src={mfaQrCodeUrl} alt="MFA QR Code" style={{ width: '200px', height: '200px', margin: '20px auto', display: 'block' }} />
                  <p>Or manually enter the secret: <strong>{mfaSecret}</strong></p>
                  <form onSubmit={handleCompleteMfaSetup}>
                    <InputGroup
                      label="Enter Code from App"
                      type="text"
                      id="mfa-setup-code"
                      name="mfaSetupCode"
                      value={mfaSetupCode}
                      onChange={handleMfaSetupCodeChange}
                      required
                      pattern="\d{6}"
                      maxLength="6"
                      autoComplete="one-time-code"
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
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MfaSettings;