// src/pages/AllProductsPage.jsx
import React from 'react';
import ProductList from '../components/ProductList';

const AllProductsPage = ({ user }) => {
  return <ProductList user={user} showMyProductsOnly={false} />;
};

export default AllProductsPage;