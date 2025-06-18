// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import MessageDisplay from './MessageDisplay'; // Assuming you have this
import '../index.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // This route is public, so no token needed
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();

                if (response.ok) {
                    setProducts(data.products);
                    showMessage(data.message, 'success');
                } else {
                    showMessage(data.message || 'Failed to fetch products.', 'error');
                }
            } catch (error) {
                console.error('Network error fetching products:', error);
                showMessage('Network error. Could not fetch products.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array to fetch once on mount

    if (loading) {
        return <div className="container">Loading Products...</div>;
    }

    return (
        <div className="container product-list-container">
            <h2>All Products</h2>
            <MessageDisplay message={message} type={messageType} isActive={messageActive} />
            {products.length === 0 ? (
                <p>No products available yet. Add some!</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p className="product-price">₹{product.price.toFixed(2)}</p> {/* Format currency */}
                            <p className="product-description">{product.description}</p>
                            <small>Added by: {product.user?.username || product.user?.email || 'Unknown'}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;