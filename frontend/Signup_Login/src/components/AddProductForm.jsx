import React, { useState } from 'react';
import InputGroup from './InputGroup';
import MessageDisplay from './MessageDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddProductForm = ({ user, onProductAdded }) => { // Accepts user info and a callback for when a product is added
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        image: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageActive, setMessageActive] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e) => {
        setProductForm({ ...productForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        const { name, price, description, image } = productForm;

        // Client-side validation
        if (!name || !price || !description) {
            showMessage('Please fill in all required fields (Name, Price, Description).', 'error');
            setLoading(false);
            return;
        }
        if (isNaN(price) || parseFloat(price) < 0) {
            showMessage('Price must be a positive number.', 'error');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token'); // Get the token from localStorage

        if (!token) {
            showMessage('You must be logged in to add a product.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // *** IMPORTANT: Send the JWT token ***
                },
                body: JSON.stringify({ name, price: parseFloat(price), description, image }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Product added successfully!', 'success');
                setProductForm({ name: '', price: '', description: '', image: '' }); // Clear form
                console.log('Product added:', data.product);
                if (onProductAdded) {
                    onProductAdded(data.product); // Notify parent (App.jsx) if needed
                }
            } else {
                showMessage(data.message || 'Failed to add product. Please try again.', 'error');
                console.error('Add product error:', data);
            }
        } catch (error) {
            console.error('Network error during product add:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Add New Product</h2>
            {user ? (
                <p>Logged in as: {user.username || user.email}</p>
            ) : (
                <p>Please log in to add products.</p>
            )}

            <form onSubmit={handleSubmit}>
                <InputGroup
                    label="Product Name"
                    type="text"
                    id="product-name"
                    name="name"
                    value={productForm.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Laptop, Smartphone"
                />
                <InputGroup
                    label="Price"
                    type="number"
                    id="product-price"
                    name="price"
                    value={productForm.price}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 999.99"
                />
                <InputGroup
                    label="Description"
                    type="text" // Could be 'textarea' but for simplicity, using 'text' here
                    id="product-description"
                    name="description"
                    value={productForm.description}
                    onChange={handleChange}
                    required
                    placeholder="A brief description of the product."
                />
                <InputGroup
                    label="Image URL (Optional)"
                    type="text"
                    id="product-image"
                    name="image"
                    value={productForm.image}
                    onChange={handleChange}
                    placeholder="e.g., https://example.com/image.jpg"
                />

                <button type="submit" disabled={loading || !user}> {/* Disable if loading or not authenticated */}
                    {loading ? (
                        <>
                            <span className="loading-spinner"></span> Adding Product...
                        </>
                    ) : (
                        'Add Product'
                    )}
                </button>
            </form>
            <MessageDisplay message={message} type={messageType} isActive={messageActive} />
        </div>
    );
};

export default AddProductForm;