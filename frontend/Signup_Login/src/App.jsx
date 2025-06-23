import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom"; // Import useLocation

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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const navigate = useNavigate();
  const location = useLocation(); // Get current location object

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
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
    const currentPath = location.pathname; // Use location.pathname
    const PUBLIC_PATHS = [
      "/login",
      "/signup",
      "/forgotpassword",
      "/resetPassword", // Simplified, as the route uses :token
    ];

    // Check if the current path is one of the public authentication paths
    const isAuthPath = PUBLIC_PATHS.some((pathPrefix) =>
      currentPath.startsWith(pathPrefix)
    );

    // Specifically handle the reset password page for unauthenticated users
    if (currentPath.startsWith("/resetPassword/") && !isAuthenticated) {
      // Allow access to the reset password page if there's a token in the URL
      // and the user is not authenticated. Do not redirect.
      console.log(
        "App Init: Allowing access to resetpassword page for unauthenticated user."
      );
      return;
    }

    if (!isAuthenticated) {
      // If not authenticated:
      // If trying to access a protected path, redirect to login
      if (!isAuthPath) {
        console.log(
          "App Init: Not authenticated on protected path, redirecting to /login"
        );
        navigate("/login", { replace: true });
      }
      // If on an auth path (login, signup, forgotpassword, or resetpassword with a token),
      // just stay there. No redirection needed.
    } else {
      // If authenticated:
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
  }, [isAuthenticated, navigate, location.pathname]); // Add location.pathname to dependencies

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true); // Update state here so useEffect reacts
    setUser(userData); // Update user state
    navigate("/products");
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
        <Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
        <Route
          path="/login"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/signup"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route
          path="/products"
          element={
            <AllProductsPage
              currentUser={currentUser}
              onUserUpdate={handleUserUpdate}
              user={user}
            />
          }
        />
        <Route
          path="/products/:id"
          element={<ProductDetailPage user={currentUser} />}
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddProductPage
                user={currentUser}
                onProductAdded={handleProductAdded}
              />
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
