import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import googleLogo from "../images/google logo.png";
import "./design/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard"); // Redirect to dashboard if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login", 
        formData
      );
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("username", formData.username);
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("email", response.data.email);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data);
      alert(error.response?.data?.error || "Invalid credentials");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Initiating Google login...");
    const googleAuthUrl = "https://it342-g5-cartella.onrender.com/login/oauth2/code/google";
    console.log("Redirecting to:", googleAuthUrl);
    window.location.href = googleAuthUrl;
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
          <h2>LOG IN</h2>
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
          
          {/* OR Divider */}
          <div className="or-divider" style={{ color: '#949494' }}>
            ━━━━━━━━━ OR ━━━━━━━━━
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
          >
            <img
              src={googleLogo}
              alt="Google Logo"
              className="google-logo"
            />
            Log in with Google
          </button>
          
          <p>New to Cartella? <a href="/register">Register</a></p>
          <p className="vendor-link">
            <a href="/vendor-login">Become Vendor at Cartella</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;