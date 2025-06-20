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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const currentPath = window.location.pathname;
    console.log("App useEffect running. Path:", currentPath, "Authenticated:", !!token); 
    const PUBLIC_PATHS = [
      "/login",
      "/signup",
      "/forgotpassword",
      "/resetPassword/", 
    ];
    const isPublicPath = PUBLIC_PATHS.some(pathPrefix =>
      currentPath.startsWith(pathPrefix)
    );
    console.log("isPublicPath:", isPublicPath);
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if (
          currentPath === "/" ||
          isPublicPath
        ) {
          navigate("/products");
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login");
      }
    } else {
      // If not authenticated, ensure we only redirect to login if we are on a protected route
      // or a route that shouldn't be accessed unauthenticated (other than auth-related ones).
      // const allowedUnauthenticatedPaths = [
      //   "/login",
      //   "/signup",
      //   "/forgotpassword",

      //   // "/resetpassword/",
      // ];
      // const isAllowedUnauthenticatedPath =
      //   allowedUnauthenticatedPaths.some((path) =>
      //     currentPath.startsWith(path)
      //   ) || currentPath.startsWith("/resetpassword/");
      console.log("User is NOT authenticated.");
      if (currentPath === "/") {
        console.log("Unauthenticated user on root. Navigating to /login.");
        navigate("/login");
      } else if (!isPublicPath) {
        console.log("Unauthenticated user on non-public path. Navigating to /login.");
        navigate("/login");
      }else{
        console.log("Unauthenticated user on public path. Allowing access.");
      }
    }
  }, [navigate]);

  const handleAuthSuccess = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
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
        <Route
          path="/"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route path="/products" element={<AllProductsPage user={user} />} />
        <Route
          path="/products/:id"
          element={<ProductDetailPage user={user} />}
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddProductPage user={user} onProductAdded={handleProductAdded} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyProductsPage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditProductPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
