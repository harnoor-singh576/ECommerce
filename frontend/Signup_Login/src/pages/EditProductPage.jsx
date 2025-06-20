// src/pages/EditProductPage.jsx
import React from "react";
import EditProductForm from "../components/EditProductForm";

const EditProductPage = ({ user }) => {
  return <EditProductForm user={user} />;
};

export default EditProductPage;
