
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InputGroup from './InputGroup';
import MessageDisplay from './MessageDisplay';
import '../index.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProductForm = ({ user }) => {
    const { id } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        image: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(true); // Initial loading for fetching product
    const [submitting, setSubmitting] = useState(false); // Loading for form submission

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

    // Fetch product data on component mount
    useEffect(() => {
        
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`);
                const data = await response.json();

                if (response.ok && data.product) {
                    setProductForm({
                        name: data.product.name,
                        price: data.product.price,
                        description: data.product.description,
                        image: data.product.image || ''
                    });
                    // Client-side owner check for UX (backend provides ultimate security)
                    if (user && data.product.user && data.product.user._id !== user.id) {
                        showMessage('You are not authorized to edit this product.', 'error');
                        navigate('/products'); // Redirect if not owner
                    }
                } else {
                    showMessage(data.message || 'Product not found.', 'error');
                    navigate('/products'); // Redirect if product not found
                }
            } catch (error) {
                console.error('Network error fetching product for edit:', error);
                showMessage('Network error. Could not load product for editing.', 'error');
                navigate('/products'); // Redirect on network error
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only try to fetch if user is logged in
            fetchProduct();
        } else {
            // If user is not logged in, rely on ProtectedRoute to redirect
            setLoading(false);
        }
    }, [id, navigate, user]); // Re-fetch if ID or user changes

    const handleChange = (e) => {
        setProductForm({ ...productForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        setMessageType('');

        const { name, price, description, image } = productForm;

        if (!name || !price || !description) {
            showMessage('Please fill in all required fields (Name, Price, Description).', 'error');
            setSubmitting(false);
            return;
        }
        if (isNaN(price) || parseFloat(price) < 0) {
            showMessage('Price must be a positive number.', 'error');
            setSubmitting(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('You must be logged in to update a product.', 'error');
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, price: parseFloat(price), description, image }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Product updated successfully!', 'success');
                console.log('Product updated:', data.product);
                navigate(`/products/${id}`); // Navigate to the product detail page after update
            } else {
                showMessage(data.message || 'Failed to update product. Please try again.', 'error');
                console.error('Update product error:', data);
            }
        } catch (error) {
            console.error('Network error during product update:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
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
                <InputGroup
                    label="Image URL (Optional)"
                    type="text"
                    id="edit-product-image"
                    name="image"
                    value={productForm.image}
                    onChange={handleChange}
                />

                <button type="submit" disabled={submitting}>
                    {submitting ? (
                        <>
                            <span className="loading-spinner"></span> Updating Product...
                        </>
                    ) : (
                        'Update Product'
                    )}
                </button>
                <button type="button" onClick={() => navigate('/products')} className="cancel-button">
                    Cancel
                </button>
            </form>
            <MessageDisplay message={message} type={messageType} isActive={messageActive} />
        </div>
    );
};

export default EditProductForm;