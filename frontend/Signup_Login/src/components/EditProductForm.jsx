import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InputGroup from "./InputGroup";
import MessageDisplay from "./MessageDisplay";
import { useAuth } from "../contexts/AuthContext";
import "../index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProductForm = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    currentImageUrl: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
 
  

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

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showMessage("Authentication token missing.", "error");
          navigate("/login");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await response.json();

        if (response.ok && data.product) {
          const productOwnerId =
            (typeof data.product.user === "object" && data.product.user?._id) ||
            (typeof data.product.user === "string" && data.product.user) ||
            null;
          if (user && productOwnerId && String(productOwnerId) !== String(user.id)) {
            showMessage("You are not authorized to edit this product.", "error");
            navigate("/products");
            return;
          }        
          setProductForm({
            name: data.product.name || "",
            price: data.product.price ? data.product.price.toString() : "",
            description: data.product.description || "",
            image: null,
            currentImageUrl: data.product.image || "",
          });
          
          
        } else {
          showMessage(data.message || "Product not found.", "error");
          navigate("/products"); // Redirect if product not found
        }
      } catch (error) {
        console.error("Network error fetching product for edit:", error);
        showMessage(
          "Network error. Could not load product for editing.",
          "error"
        );
        navigate("/products"); // Redirect on network error
      } finally {
        setIsFetching(false);
      }
    };

    
      
      fetchProduct();
    
  }, [id, navigate, user]); // Re-fetch if ID or user changes

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setProductForm((prevForm) => ({
      ...prevForm,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    const { name, price, description, image, currentImageUrl } = productForm;

    if (!name || !price || !description) {
      showMessage(
        "Please fill in all required fields (Name, Price, Description).",
        "error"
      );
      setSubmitting(false);
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      showMessage("Price must be a positive number.", "error");
      setSubmitting(false);
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

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("You must be logged in to edit a product.", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    if (image) {
      formData.append("image", image); // Only append new file if selected
    } else {
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Product updated successfully!", "success");
        console.log("Product updated:", data.product);
        navigate(`/products/${id}`); // Navigate to the product detail page after update
      } else {
        showMessage(
          data.message || "Failed to update product. Please try again.",
          "error"
        );
        console.error("Update product error:", data);
      }
    } catch (error) {
      console.error("Network error during product update:", error);
      showMessage(
        "Network error. Please check your connection or server status.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return <div className="container">Loading product for editing...</div>;
  }

  return (
    <div className="container">
      <h2>Edit Product</h2>
      <p>Editing product ID: {id}</p>

      <form onSubmit={handleSubmit}>
        <InputGroup
          label="Product Name"
          type="text"
          id="edit-product-name"
          name="name"
          value={productForm.name}
          onChange={handleChange}
          required
        />
        <InputGroup
          label="Price"
          type="number"
          id="edit-product-price"
          name="price"
          value={productForm.price}
          onChange={handleChange}
          required
          step="0.01"
        />
        <InputGroup
          label="Description"
          type="text"
          id="edit-product-description"
          name="description"
          value={productForm.description}
          onChange={handleChange}
          required
        />
        {productForm.currentImageUrl && (
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <label>Current Image:</label>
            <img
              src={productForm.currentImageUrl.startsWith("http")
                  ? productForm.currentImageUrl
                  : `${API_BASE_URL}/uploads/${productForm.currentImageUrl}`} // Adjust path for URL
              alt="Current Product"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                border: "1px solid #ccc",
                marginTop: "5px",
              }}
            />
          </div>
        )}

        {productForm.image && (
  <div style={{ marginBottom: "15px", textAlign: "center" }}>
    <label>New Image Preview:</label>
    <img
      src={URL.createObjectURL(productForm.image)}
      alt="New Product Preview"
      style={{
        maxWidth: "200px",
        maxHeight: "200px",
        border: "1px solid #ccc",
        marginTop: "5px",
      }}
    />
  </div>
)}

        <InputGroup
          label="Upload New Product Image (Optional)"
          type="file"
          id="edit-product-image"
          name="image"
          
          onChange={handleChange}
          accept="image/*"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span> Updating Product...
            </>
          ) : (
            "Update Product"
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="cancel-button"
        >
          Cancel
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

export default EditProductForm;
