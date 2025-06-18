import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';
import MyProductList from './components/MyProductList';
import ResetPassword from './components/ResetPassword';

import './index.css'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);                
                setIsAuthenticated(true);
                if (window.location.pathname === '/' || window.location.pathname === '/login') {
                    navigate('/products');
                }
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
                navigate('/login');
            }
        }
        else{
          if (window.location.pathname !== '/signup' && window.location.pathname !== '/login') {
                navigate('/login');
            }
        }
    }, []);
    const handleAuthSuccess = (token, userData) => {
        setIsAuthenticated(true);
        setUser(userData);        
        navigate('/add-product');
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    };
     const handleProductAdded = (newProduct) => {
        console.log('Product added successfully in App:', newProduct);
        navigate('/my-products');
     };

     const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
           return navigate('/login');
        }
        return children;
     }
  return (
    
    
      <div className="App">
        {isAuthenticated && (
                <button
                    onClick={handleLogout}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '10px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        zIndex: 100 
                    }}
                >
                    Logout
                </button>
            )}
        <Routes>
          <Route path="/" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />            
          <Route path="/login" element={<AuthForm onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/signup" element={<AuthForm onAuthSuccess={handleAuthSuccess}/>} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />  
          <Route
                    path="/add-product"
                    element={
                        <ProtectedRoute>
                            <AddProductForm user={user} onProductAdded={handleProductAdded} />
                        </ProtectedRoute>
                    }
            />    
            <Route
                    path="/my-products" 
                    element={
                        <ProtectedRoute>
                            <MyProductList user={user} /> 
                        </ProtectedRoute>
                    }
                />
            <Route path="/products" element={<ProductList />} /> 
            <Route path="*" element={<div>404 Not Found</div>} />           
        </Routes>
      </div>
    
  );
}

export default App;