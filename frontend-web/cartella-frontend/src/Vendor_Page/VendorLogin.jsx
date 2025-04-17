import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import "./design/VendorLogin.css";

const VendorLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const vendorId = sessionStorage.getItem("vendorId");
    if (token && vendorId) {
      navigate("/vendor-dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/vendors/login",
        formData
      );
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", formData.username);
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("vendorId", response.data.vendorId);
      alert("Vendor Login Successful!");
      navigate("/vendor-dashboard");
    } catch (error) {
      console.error("Vendor Login error:", error.response?.data);
      alert(error.response?.data?.error || "Invalid credentials");
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
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Log In</button>

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
