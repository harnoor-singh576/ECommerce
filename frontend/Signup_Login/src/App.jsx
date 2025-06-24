// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";


import LoginPage from "./pages/LoginPage"; // Still using LoginPage, which renders AuthForm
import ProtectedPage from "./pages/ProtectedPage";
import AllProductsPage from "./pages/AllProductsPage";
import MyProductsPage from "./pages/MyProductsPage";
import AddProductPage from "./pages/AddProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import EditProductPage from "./pages/EditProductPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Removed ProtectedRoute import as PrivateRoute from useAuth context replaces it
import ProfilePage from "./pages/ProfilePage";
import AuthForm from "./components/AuthForm"; // AuthForm handles login/signup and updates context directly
import { useAuth } from "./contexts/AuthContext"; // Centralized authentication state
import "./index.css";

// Component to protect routes.
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Get auth state from context

  if (loading) {
    // Show a loading indicator while authentication status is being determined
    return <div className="full-page-loader">Loading application...</div>;
  }

  // If user is null (not authenticated), redirect to login page
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user, logout, loading } = useAuth(); // Consume auth state from context
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This effect handles global redirection based on authentication state
    // and current path. It runs after the AuthContext has finished loading.
    if (loading) {
      return; // Do nothing while auth context is still loading
    }

    const currentPath = location.pathname;
    const PUBLIC_PATHS = [
      "/login",
      "/signup",
      "/forgotpassword",
      "/resetPassword", // Matches '/resetPassword/:token'
    ];

    // Check if the current path is one of the public authentication paths
    const isAuthPath = PUBLIC_PATHS.some((pathPrefix) =>
      currentPath.startsWith(pathPrefix)
    );

    // Specifically handle the reset password page for unauthenticated users
    // This part was problematic; now correctly checks for `!user`
    if (currentPath.startsWith("/resetPassword/") && !user) {
      console.log(
        "App Init: Allowing access to resetpassword page for unauthenticated user."
      );
      return; // Do not redirect if on a reset password path and not logged in
    }

    // If user is NOT authenticated
    if (!user) {
      // If trying to access a protected path (not an auth path), redirect to login
      if (!isAuthPath) {
        console.log(
          "App Init: Not authenticated on protected path, redirecting to /login"
        );
        navigate("/login", { replace: true });
      }
      // If on an auth path (login, signup, forgotpassword, or resetpassword), stay there.
    } else {
      // If user IS authenticated
      // If on a public authentication path (like /login, /signup, /forgotpassword)
      // or the root path "/", redirect to /products.
      if (isAuthPath || currentPath === "/") {
        console.log(
          "App Init: Authenticated on public/root path, redirecting to /products"
        );
        navigate("/products", { replace: true });
      }
      // If authenticated and on a protected product-related page, stay there.
    }
  }, [user, loading, navigate, location.pathname]); // Dependencies: react to user, loading, and path changes

  const handleProductAdded = (newProduct) => {
    console.log("Product added successfully in App:", newProduct);
    navigate("/products");
  };

  return (
    <div className="App">
      {/* Show navigation and logout button ONLY if user is authenticated */}
      {user && (
        <>
          <button
            onClick={logout} // Use logout from useAuth context
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "10px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 100,
            }}
          >
            Logout
          </button>
          <nav
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 100,
              marginBottom: "20px",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                gap: "15px",
              }}
            >
              <li>
                <Link
                  to="/products"
                  style={{
                    color: "black",
                    textDecoration: "none",
                    background: "lightgrey",
                    borderRadius: "5px",
                    padding: "10px",
                    fontWeight: "bold",
                  }}
                >
                  All Products
                </Link>
              </li>
              {/* Navigation links now correctly check for `user` from context */}
              {user && (
                <li>
                  <Link
                    to="/my-products"
                    style={{
                      color: "black",
                      textDecoration: "none",
                      background: "lightgrey",
                      borderRadius: "5px",
                      padding: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    My Products
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <Link
                    to="/add-product"
                    style={{
                      color: "black",
                      textDecoration: "none",
                      background: "lightgrey",
                      borderRadius: "5px",
                      padding: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Add Product
                  </Link>
                </li>
              )}
              {user && (
                <li>
                  <Link
                    to="/profile"
                    style={{
                      color: "black",
                      textDecoration: "none",
                      background: "lightgrey",
                      borderRadius: "5px",
                      padding: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Profile
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
      <Routes>
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/signup" element={<AuthForm />} />
        <Route
          path="/"
          element={user ? <Navigate to="/products" replace /> : <AuthForm />}
        />

        {/* Protected Routes using the PrivateRoute component */}
        <Route
          path="/protected"
          element={
            <PrivateRoute>
              <ProtectedPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <AllProductsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <PrivateRoute>
              <AddProductPage onProductAdded={handleProductAdded} />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-products"
          element={
            <PrivateRoute>
              <MyProductsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <PrivateRoute>
              <EditProductPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
