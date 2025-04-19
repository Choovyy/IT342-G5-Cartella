import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import "./design/VendorLogin.css";

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    dob: "",
  });

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const usernameRef = useRef(null);
  const dobRef = useRef(null);

  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    // Exactly 11 digits
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(phone);
  };

  const validateUsername = (username) => {
    // At least 4 characters, letters, numbers, underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
    return usernameRegex.test(username);
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return false;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear server error when user starts typing
    setServerError("");
    
    // Validate on change
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (!validatePassword(value)) {
          error = "Password must be 8+ characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character";
        }
        break;
      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = "Phone number must be exactly 11 digits";
        }
        break;
      case "username":
        if (!value) {
          error = "Username is required";
        } else if (!validateUsername(value)) {
          error = "Username must be at least 4 characters (letters, numbers, underscore only)";
        }
        break;
      case "dob":
        if (!value) {
          error = "Date of birth is required";
        } else if (!validateDateOfBirth(value)) {
          error = "You must be at least 18 years old to register";
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous server errors
    setServerError("");
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Navigate to the next step with form data
      navigate("/vendor-register-step2", { state: formData });
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
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
          <h2>VENDOR REGISTER</h2>
          
          {/* Server Error Display */}
          {serverError && (
            <div className="error-message" style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
              {serverError}
            </div>
          )}

          <div className="form-field">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              required
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>
          
          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              required
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-field">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "error" : ""}
              required
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          {/* Birth Date - Inline Label and Input */}
          <div className="form-field" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", marginBottom: "10px" }}>
            <label htmlFor="dob" style={{ fontSize: "14px", minWidth: "80px" }}>Birth Date</label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              className={errors.dob ? "error" : ""}
              required
              style={{ flex: 1 }}
            />
            {errors.dob && <div className="error-text">{errors.dob}</div>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Next"}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '5px 0' }}>
              Already have a vendor account?
              <Link to="/vendor-login"> Log In</Link>
            </p>
            <p style={{ margin: '5px 0' }}>
              <Link to="/login">Customer Log In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;