import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
const VendorLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const vendorId = sessionStorage.getItem("vendorId");
    if (token && vendorId) {
      navigate("/vendor-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/vendors/login",
        formData
      );
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("username", formData.username);
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("vendorId", response.data.vendorId);
      sessionStorage.setItem("businessName", response.data.businessName);
      sessionStorage.setItem("joinedDate", response.data.joinedDate);
      
      alert("Vendor Login Successful!");
      navigate("/vendor-dashboard");
    } catch (error) {
      console.error("Vendor Login error:", error.response?.data);
      alert(error.response?.data?.error || "Invalid credentials");
    } finally {
      setIsLoading(false);
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

        <form onSubmit={handleSubmit}>
          <h2>VENDOR LOGIN</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Log In"}
          </button>

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