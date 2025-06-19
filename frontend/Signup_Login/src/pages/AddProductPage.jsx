// src/pages/AddProductPage.jsx
import React from 'react';
import AddProductForm from '../components/AddProductForm';

const AddProductPage = ({ user, onProductAdded }) => {
  return <AddProductForm user={user} onProductAdded={onProductAdded} />;
};

export default AddProductPage;