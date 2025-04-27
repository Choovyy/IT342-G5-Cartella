import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer, Slide } from "react-toastify";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import authService from "../api/authService";

const VendorLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
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
    try {
      const response = await authService.loginVendor(formData);
      
      toast.success("Logging In", {
        position: "bottom-right",
        closeButton: false,
        style: {
          backgroundColor: "#ffffff",
          color: "#333333",
          border: "1px solid #cccccc",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "8px",
          pointerEvents: "none",
        }
      });

      setTimeout(() => {
        navigate("/vendor-dashboard");
      }, 3000);
    } catch (error) {
      console.error("Vendor Login error:", error.response?.data);

      toast.error("Invalid Credentials", {
        position: "bottom-right",
        closeButton: false,
        style: {
          backgroundColor: "#ffffff",
          color: "#ff3333",
          border: "1px solid #cccccc",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "8px",
          pointerEvents: "none",
        }
      });
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
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            required
          />
          <button type="submit">
            Log In
          </button>

          <p>New Vendor? <a href="/vendor-register">Register</a></p>
          <p className="vendor-link">
            <a href="/login">Customer Log In</a>
          </p>
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer
        hideProgressBar={false}
        closeButton={false}
        newestOnTop={false}
        pauseOnHover={false}
        draggable={false}
        autoClose={2000}
        transition={Slide}
      />
    </div>
  );
};

export default VendorLogin;