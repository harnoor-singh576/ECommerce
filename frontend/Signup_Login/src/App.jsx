// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AllProductsPage from "./pages/AllProductsPage";
import MyProductsPage from "./pages/MyProductsPage";
import AddProductPage from "./pages/AddProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import EditProductPage from "./pages/EditProductPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(
    () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  }
  );
  
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure consistency: if the user object from localStorage has 'id', let's use it.
        // If it had '_id' (from backend), it would also work.
        // The console logs showed user.id, so we'll stick with that as the primary ID.
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    // --- Initial Redirect Logic ---
    // This part runs once on mount to handle initial navigation.
    // It should not interfere with subsequent navigations by Link or navigate calls.
    const currentPath = window.location.pathname;
    const PUBLIC_PATHS = [
      "/login",
      "/signup",
      "/forgotpassword",
      "/resetpassword/", // Note: This needs to match the route definition
    ];
    const isPublicPath = PUBLIC_PATHS.some((pathPrefix) =>
      currentPath.startsWith(pathPrefix)
    );

    if (!isAuthenticated && !isPublicPath) {
      // If not authenticated AND on a protected path, redirect to login
      if (currentPath !== "/") {
        // Prevent double redirect if already handled by BrowserRouter default
        console.log(
          "App Init: Not authenticated on protected path, redirecting to /login"
        );
        navigate("/login", { replace: true });
      } else {
        // Handle root path specifically for unauthenticated users
        console.log(
          "App Init: Not authenticated on root, redirecting to /login"
        );
        navigate("/login", { replace: true });
      }
    } else if (isAuthenticated && (currentPath === "/" || isPublicPath)) {
      // If authenticated AND on a public path (like login/signup), redirect to products
      console.log(
        "App Init: Authenticated on public path, redirecting to /products"
      );
      navigate("/products", { replace: true });
    }
  }, [isAuthenticated, navigate]); // Empty dependency array means this runs once on mount

  // Additional useEffect for `isAuthenticated` changes, if any logic depends on it
  // This helps with initial rendering after login/logout
  // useEffect(() => {
  //   // If the user logs out, make sure they are redirected if they are on a protected page
  //   if (
  //     !isAuthenticated &&
  //     !window.location.pathname.startsWith("/login") &&
  //     !window.location.pathname.startsWith("/signup") &&
  //     !window.location.pathname.startsWith("/forgotpassword") &&
  //     !window.location.pathname.startsWith("/resetpassword")
  //   ) {
  //     // navigate('/login', { replace: true });
      
  //   }
  // }, [isAuthenticated, navigate]);

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Keep localStorage in sync
  };

  const handleAuthSuccess = (token, userData) => {
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/products"); // Direct navigation after successful login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  const handleProductAdded = (newProduct) => {
    console.log("Product added successfully in App:", newProduct);
    navigate("/products");
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <>
          {/* Logout button and navigation menu */}
          <button
            onClick={handleLogout}
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
              {isAuthenticated && (
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
              {isAuthenticated && (
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
            </ul>
          </nav>
        </>
      )}
      <Routes>
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
        <Route
          path="/login"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/signup"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />
        {/* If root path needs to be accessible when not logged in, change this */}
        <Route
          path="/"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route path="/products" element={<AllProductsPage currentUser={currentUser} onUserUpdate={handleUserUpdate} user={user} />} />
        <Route
          path="/products/:id"
          element={<ProductDetailPage user={currentUser} />}
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddProductPage user={currentUser} onProductAdded={handleProductAdded} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyProductsPage user={currentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditProductPage user={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
