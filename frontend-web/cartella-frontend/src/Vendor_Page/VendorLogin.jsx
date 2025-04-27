import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../api/authService";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import axios from "axios";

const VendorLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isVendorAuthenticated()) {
      navigate("/vendor-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  const validateForm = () => {
    // Basic validation: check if fields are not empty
    return formData.username && formData.password;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear any previous messages
    setMessage("");
    setError("");
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // Use environment variable for API URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await axios.post(`${API_URL}/vendors/login`, formData);
      
      // Handle the successful login
      setMessage(response.data.message || "Login successful!");
      setError("");
      navigate("/vendor-dashboard");
    } catch (error) {
      console.error("Vendor Login error:", error.response?.data);
      setError(error.response?.data?.error || "Invalid credentials");
      setMessage("");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE - BRANDING */}
      <div className="login-branding">
        <img src={logo} alt="Cartella Logo" className="logo-image" />
        <h2>Cartella</h2>
        <p>Your ultimate destination for seamless shopping</p>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="login-form-container">
        {/* TOP - LIGHT LOGO AND NAME */}
        <div className="logo-light-container">
          <img src={logoLight} alt="Cartella Light Logo" className="logo-light-image" />
          <h2 className="logo-light-name">Cartella</h2>
        </div>

        <form onSubmit={handleLogin}>
          <h2>VENDOR LOGIN</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={isLoggingIn}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={isLoggingIn}
            required
          />
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging In..." : "Log In"}
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <p>New Vendor? <a href="/vendor-register">Register</a></p>
          <p className="vendor-link">
            <a href="/login">Customer Log In</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VendorLogin;