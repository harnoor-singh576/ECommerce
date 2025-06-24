// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import InputGroup from "../components/InputGroup";
import MessageDisplay from "../components/MessageDisplay";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth hook

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfilePage = () => {
  const { user, token, updateAuth } = useAuth(); // Get user, token, and updateAuth from context
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null); // For the file input
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState(""); // For displaying existing picture
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to display messages
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

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      // Construct full URL for profile picture if it exists
      setCurrentProfilePictureUrl(
        user.profilePicture ? `${API_BASE_URL}/${user.profilePicture}` : ""
      );
    }
  }, [user]); // Rerun when user object from context changes

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!token) {
      showMessage("Authentication token missing. Please log in again.", "error");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // No 'Content-Type' header here; FormData sets it automatically with the correct boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Profile updated successfully!", "success");
        // Update the user data in AuthContext
        updateAuth(token, data.user);
        // Clear the file input after successful upload
        setProfilePictureFile(null);
        // Optionally, reset the file input element's value if desired
        document.getElementById('profile-picture-input').value = '';
      } else {
        showMessage(data.message || "Failed to update profile. Please try again.", "error");
        console.error("Profile update error:", data);
      }
    } catch (error) {
      console.error("Network error during profile update:", error);
      showMessage(
        "Network error. Please check your connection or server status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    // This case should ideally be handled by a ProtectedRoute or similar,
    // but a fallback message is good practice.
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container">
      <h2>Update Profile</h2>
      <MessageDisplay
        message={message}
        type={messageType}
        isActive={messageActive}
      />
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-picture-section">
          {currentProfilePictureUrl ? (
            <img
              src={currentProfilePictureUrl}
              alt="Current Profile"
              className="profile-picture-preview"
            />
          ) : (
            <div className="no-profile-picture">No profile picture</div>
          )}
          <InputGroup
            label="Upload New Profile Picture"
            type="file"
            id="profile-picture-input"
            name="profilePicture"
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
          />
        </div>

        <InputGroup
          label="Username"
          type="text"
          id="profile-username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        <InputGroup
          label="Email"
          type="email"
          id="profile-email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span> Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
