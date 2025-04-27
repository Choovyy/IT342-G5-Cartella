import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import googleLogo from "../images/google-logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...userData } = formData;
      
      await authService.registerUser(userData);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      alert(error.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    alert("Google registration feature is coming soon!");
    // Will implement OAuth with Google later
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE - BRANDING */}
      <div className="login-branding">
        <img src={logo} alt="Cartella Logo" className="logo-image" />
        <h2>Cartella</h2>
        <p>Your ultimate destination for seamless shopping</p>
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div className="login-form-container">
        {/* TOP - LIGHT LOGO AND NAME */}
        <div className="logo-light-container">
          <img src={logoLight} alt="Cartella Light Logo" className="logo-light-image" />
          <h2 className="logo-light-name">Cartella</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>SIGN UP</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
          <p>
            Already have an account? <a href="/login">Log In</a>
          </p>
          <p className="vendor-link">
            <a href="/vendor-login">Become Vendor at Cartella</a>
          </p>
        </form>

        <div className="google-register" onClick={handleGoogleRegister}>
          <img src={googleLogo} alt="Google Logo" />
          <span>Register with Google</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
