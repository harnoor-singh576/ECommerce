// src/pages/MyProductsPage.jsx
import React from "react";
import ProductList from "../components/ProductList"; // Reusing ProductList

const MyProductsPage = ({ user }) => {
  return <ProductList user={user} showMyProductsOnly={true} />;
};

export default MyProductsPage;
