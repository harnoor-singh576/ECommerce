// src/components/MyProductList.jsx
import React, { useState, useEffect } from 'react';
import MessageDisplay from './MessageDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyProductList = () => {
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
        const fetchMyProducts = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('You must be logged in to view your products.', 'error');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/products/my`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    setProducts(data.products);
                    showMessage(data.message, 'success');
                } else {
                    showMessage(data.message || 'Failed to fetch your products.', 'error');
                }
            } catch (error) {
                console.error('Network error fetching my products:', error);
                showMessage('Network error. Could not fetch your products.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, []);

    if (loading) {
        return <div className="container">Loading Your Products...</div>;
    }

    return (
        <div className="container product-list-container">
            <h2>My Products</h2>
            <MessageDisplay message={message} type={messageType} isActive={messageActive} />
            {products.length === 0 ? (
                <p>You haven't added any products yet.</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p className="product-price">₹{product.price.toFixed(2)}</p>
                            <p className="product-description">{product.description}</p>
                            <small>Added: {new Date(product.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProductList;