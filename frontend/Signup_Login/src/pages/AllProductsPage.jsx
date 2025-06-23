// src/pages/AllProductsPage.jsx
import React from "react";
import ProductList from "../components/ProductList";
import MfaSettings from "../components/MfaSettings";

const AllProductsPage = ({ currentUser, onUserUpdate }) => {
  return (
    <div className="container">
      <h1>Products</h1>
      {/* Display welcome message for authenticated user */}
      {currentUser && (
        <p>
          Welcome,{" "}
          <strong>{currentUser.username || currentUser.email || "User"}</strong>!
        </p>
      )}

      {/* Render the MFA Settings component */}
      {currentUser && ( // Only show MFA settings if a user is logged in
        <MfaSettings currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}

      {/* Horizontal line for separation */}
      <hr style={{ margin: "30px 0", borderColor: "#eee" }} />

      {/* Your existing ProductList component */}
      <ProductList user={currentUser} showMyProductsOnly={false} />
    </div>
  );
};

export default AllProductsPage;
