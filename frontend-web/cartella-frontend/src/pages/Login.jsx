import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Slide } from "react-toastify";
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
        "https://it342-g5-cartella.onrender.com/api/users/login", 
        formData
      );
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("username", formData.username);
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("email", response.data.email);
      
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
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Login error:", error.response?.data);      
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

  const handleGoogleLogin = () => {
    console.log("Initiating Google login...");
    
    // This should point to the authorization endpoint, not the callback URL
    const googleAuthUrl = "https://it342-g5-cartella.onrender.com/oauth2/authorization/google";
    console.log("Redirecting to:", googleAuthUrl);
    
    // Use this approach for more control over the OAuth flow
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

export default Login;
