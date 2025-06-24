import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MessageDisplay from "./MessageDisplay";

import "../index.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductDetail = ({ user }) => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageActive, setMessageActive] = useState(false);
  const [loading, setLoading] = useState(true);

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
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await response.json();

        if (response.ok && data.product) {
          setProduct(data.product);
        } else {
          showMessage(
            data.message || "Failed to fetch product details.",
            "error"
          );
          setProduct(null); // Clear product if not found
        }
      } catch (error) {
        console.error("Network error fetching product:", error);
        showMessage("Network error. Could not fetch product details.", "error");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Re-fetch if ID changes

  if (loading) {
    return <div className="container">Loading product details...</div>;
  }

  if (!product) {
    return <div className="container">Product not found.</div>;
  }
  const isOwner = user && product.user && user.id === product.user._id;
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("You must be logged in to delete a product.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || "Product deleted successfully!", "success");
        navigate("/products"); // Go back to all products after deletion
      } else {
        showMessage(data.message || "Failed to delete product.", "error");
      }
    } catch (error) {
      console.error("Network error deleting product:", error);
      showMessage("Network error. Could not delete product.", "error");
    }
  };

  return (
    <div className="container product-detail-container">
      <MessageDisplay
        message={message}
        type={messageType}
        isActive={messageActive}
      />
      <div className="product-detail-content">
        <img
          src={`${API_BASE_URL}/${product.image.replace(/\\/g, "/")}`}
          alt={product.name}
          className="product-detail-image"
        />
        <h2>{product.name}</h2>
        <div className="product-info">
          <p>
            <strong>Price:</strong> ₹{product.price.toFixed(2)}
          </p>
          <p>
            <strong>Description:</strong> {product.description}
          </p>
          <p>
            <strong>Added by:</strong>{" "}
            {product.user?.username || product.user?.email || "Unknown"}
          </p>
          <p>
            <strong>Added on:</strong>{" "}
            {new Date(product.createdAt).toLocaleDateString()}
          </p>
          {/* Show Edit button if user is logged in AND is the owner */}
          {isOwner && (
            <div className="product-detail-actions">
              <Link to={`/edit-product/${product._id}`} className="edit-button">
                Edit Product
              </Link>
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            </div>
          )}
          <Link to="/products" className="back-button">
            Back to All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
