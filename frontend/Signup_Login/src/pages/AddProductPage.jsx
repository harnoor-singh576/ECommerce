// src/pages/AddProductPage.jsx
import React from "react";
import AddProductForm from "../components/AddProductForm";

const AddProductPage = ({  onProductAdded }) => {
  return <AddProductForm onProductAdded={onProductAdded} />;
};

export default AddProductPage;
