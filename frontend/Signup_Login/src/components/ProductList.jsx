// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageDisplay from './MessageDisplay'; // Assuming you have this
import '../index.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductList = ({ user, showMyProductsOnly = false }) => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();   


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

    const fetchProducts = async () => {
        setLoading(true);
        let url = `${API_BASE_URL}/products`;
        let headers = {};

        if (showMyProductsOnly) {
            url = `${API_BASE_URL}/products/my`;
            const token = localStorage.getItem('token');
            if (!token) {
                setProducts([]);
                showMessage('You must be logged in to view your products.', 'error');
                setLoading(false);
                return;
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { headers });
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products);
                
            } else {
                showMessage(data.message || `Failed to fetch ${showMyProductsOnly ? 'your' : ''} products.`, 'error');
                setProducts([]);
            }
        } catch (error) {
            console.error(`Network error fetching ${showMyProductsOnly ? 'my' : ''} products:`, error);
            showMessage('Network error. Could not fetch products.', 'error');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, [showMyProductsOnly, user?._id]);
    
    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('You must be logged in to delete a product.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Product deleted successfully!', 'success');
                setProducts(products.filter(p => p._id !== productId)); // Remove from UI
            } else {
                showMessage(data.message || 'Failed to delete product.', 'error');
            }
        } catch (error) {
            console.error('Network error deleting product:', error);
            showMessage('Network error. Could not delete product.', 'error');
        }
    };

    if (loading) {
        return <div className="container">Loading Products...</div>;
    }

    return (
        <div className="container product-list-container">
             <h2>{showMyProductsOnly ? 'My Products' : 'All Products'}</h2>
            <MessageDisplay message={message} type={messageType} isActive={messageActive} />
            {products.length === 0 ? (
                <p>{showMyProductsOnly ? "You haven't added any products yet." : "No products available yet."}</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            {console.log('Logged in user ID:', user ? user._id : 'Not logged in')}
                            {console.log('Product owner ID:', product.user ? product.user._id : 'Owner not populated/found')}
                            {console.log('Are IDs equal?', user && product.user && user._id === product.user._id)}
                            {console.log('Current user id:', user.id)}
                            {console.log('Product user id:', product.user._id )}
                            {console.log('Product id:',product._id)}
                           
                            <img src={product.image} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p className="product-price">₹{product.price.toFixed(2)}</p> 
                            <p className="product-description">{product.description}</p>
                            <small>Added by: {product.user?.username || product.user?.email || 'Unknown'}</small>

                            {user && product.user && user.id == product.user._id && (
                                <div className="product-actions">
                                    {console.log("Product ID:",product._id)
                                    }
                                    <Link to={`/edit-product/${product._id}`} className="edit-button">Edit</Link>
                                    
                                    <button onClick={() => handleDelete(product._id)} className="delete-button">Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;