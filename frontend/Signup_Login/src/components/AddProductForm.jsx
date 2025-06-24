import React, { useState } from "react";
import InputGroup from "./InputGroup";
import MessageDisplay from "./MessageDisplay";
import { useAuth } from "../contexts/AuthContext"; 
import { useNavigate } from "react-router-dom";
import "../index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddProductForm = ({ onProductAdded }) => {
  const { user, token } = useAuth(); // Get user and token from AuthContext
  const navigate = useNavigate();
  
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setProductForm((prevForm) => ({
      ...prevForm,
      [name]: type === "file" ? files[0] : value, // Store the File object
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const { name, price, description, image } = productForm;

    // Client-side validation
    if (!name || !price || !description) {
      showMessage(
        "Please fill in all required fields and select an image.",
        "error"
      );
      setLoading(false);
      return;
    }
    if (!image) { 
      showMessage("Please select an image.", "error");
      setLoading(false);
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      showMessage("Price must be a positive number.", "error");
      setLoading(false);
      return;
    }
    if (image && !image.type.startsWith("image/")) {
      showMessage("Please select a valid image file.", "error");
      setLoading(false);
      return;
    }
    if (image && image.size > 5 * 1024 * 1024) {
      // 5 MB limit
      showMessage("Image file size must not exceed 5MB.", "error");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (!user || !token) {
      showMessage("Authentication token missing. Please log in again.", "error");
      setLoading(false);
      navigate("/login"); // Redirect to login if token is missing
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image); // Append the File obj

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          
          Authorization: `Bearer ${token}`, // *** IMPORTANT: Send the JWT token ***
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Product added successfully!", "success");
        setProductForm({ name: "", price: "", description: "", image: null });
        const fileInput = document.getElementById('product-image');
if (fileInput) {fileInput.value = '';}
        console.log("Product added:", data.product);
        if (onProductAdded) {
          onProductAdded(data.product); // Notify parent (App.jsx) if needed
        }
      } else {
        showMessage(
          data.message || "Failed to add product. Please try again.",
          "error"
        );
        console.error("Add product error:", data);
      }
    } catch (error) {
      console.error("Network error during product add:", error);
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
      <h2>Add New Product</h2>
      {user ? (
        <p>Logged in as: <strong>{user.username || user.email}</strong></p>
      ) : (
        <p>You must be logged in to add products</p>
      )}

      <form onSubmit={handleSubmit}>
        <InputGroup
          label={
            <>
              Product Name <span className="required-star">*</span>
            </>
          }
          type="text"
          id="product-name"
          name="name"
          value={productForm.name}
          onChange={handleChange}
          required
          placeholder="e.g., Laptop, Smartphone"
          disabled={loading}
        />
        <InputGroup
          label={
            <>
              Price <span className="required-star">*</span>
            </>
          }
          type="number"
          id="product-price"
          name="price"
          value={productForm.price}
          onChange={handleChange}
          required
          placeholder="e.g., 999.99"
          disabled={loading}
        />
        <InputGroup
          label={
            <>
              Description <span className="required-star">*</span>
            </>
          }
          type="text" 
          id="product-description"
          name="description"
          value={productForm.description}
          onChange={handleChange}
          required
          placeholder="A brief description of the product."
          disabled={loading}
        />
        <InputGroup
          label="Choose image"
          type="file"
          id="product-image"
          name="image"
          
          onChange={handleChange}
          accept="image/*" // Accept only image files
          required
          disabled={loading}         

        />
        {productForm.image && (
  <p>Selected file: {productForm.image.name}</p>
)}

        <button type="submit" disabled={loading || !user}>
          {" "}
          {/* Disable if loading or not authenticated */}
          {loading ? (
            <>
              <span className="loading-spinner"></span> Adding Product...
            </>
          ) : (
            "Add Product"
          )}
        </button>
      </form>
      <MessageDisplay
        message={message}
        type={messageType}
        isActive={messageActive}
      />
    </div>
  );
};

export default AddProductForm;
