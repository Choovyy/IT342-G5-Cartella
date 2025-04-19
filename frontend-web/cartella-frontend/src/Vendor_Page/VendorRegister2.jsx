import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import "./design/VendorLogin.css";

const VendorRegister2 = () => {
  const { state: basicData } = useLocation();
  const [formData, setFormData] = useState({
    gender: "",
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
  });

  const [errors, setErrors] = useState({
    gender: "",
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;
      case "businessName":
        if (!value) {
          error = "Business name is required";
        } else if (value.length < 3) {
          error = "Business name must be at least 3 characters";
        }
        break;
      case "businessAddress":
        if (!value) {
          error = "Business address is required";
        } else if (value.length < 10) {
          error = "Please provide a complete address";
        }
        break;
      case "businessRegistrationNumber":
        // Optional field, but if provided, should follow a pattern
        if (value && !/^[A-Z0-9-]{5,20}$/.test(value)) {
          error = "Business registration number should be 5-20 characters (letters, numbers, hyphens)";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear server error when user starts typing
    setError("");
    
    // Validate on change
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous messages
    setMessage("");
    setError("");
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine basic data from step 1 with form data from step 2
      const fullData = { ...basicData, ...formData };
      
      // Format date of birth to match backend expectation (YYYY-MM-DD)
      if (fullData.dob) {
        const dobDate = new Date(fullData.dob);
        fullData.dob = dobDate.toISOString().split('T')[0];
      }
      
      // Format gender to match backend enum (UPPERCASE)
      if (fullData.gender) {
        fullData.gender = fullData.gender.toUpperCase();
      }
      
      const response = await axios.post("http://localhost:8080/api/vendors/register", fullData);
      
      setMessage(response.data.message || "Registration successful! Redirecting to login...");
      setError("");
      
      // Store token if provided
      if (response.data.token) {
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("username", fullData.username);
        sessionStorage.setItem("userId", response.data.userId);
        sessionStorage.setItem("vendorId", response.data.vendorId);
      }
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/vendor-login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle specific error messages from the backend
      if (err.response && err.response.data && err.response.data.error) {
        const errorMessage = err.response.data.error;
        
        // Map backend error messages to specific field errors
        if (errorMessage.includes("Username is already taken")) {
          setErrors(prev => ({ ...prev, username: "This username is already taken" }));
        } else if (errorMessage.includes("Email is already registered")) {
          setErrors(prev => ({ ...prev, email: "This email is already registered" }));
        } else if (errorMessage.includes("Phone number is already registered")) {
          setErrors(prev => ({ ...prev, phone: "This phone number is already registered" }));
        } else if (errorMessage.includes("Business registration number is already registered")) {
          setErrors(prev => ({ ...prev, businessRegistrationNumber: "This business registration number is already registered" }));
        } else {
          setError(errorMessage);
        }
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-branding">
        <img src={logo} alt="Cartella Logo" className="logo-image" />
        <h2>Cartella</h2>
        <p>Your ultimate destination for seamless shopping</p>
      </div>

      <div className="login-form-container">
        <div className="logo-light-container">
          <img src={logoLight} alt="Cartella Light Logo" className="logo-light-image" />
          <h2 className="logo-light-name">Cartella</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>VENDOR REGISTER</h2>
          
          {message && (
            <div className="success-message" style={{ color: "green", marginBottom: "15px", textAlign: "center" }}>
              {message}
            </div>
          )}
          
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div className="form-field">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? "error" : ""}
              style={{
                padding: "10px",
                border: errors.gender ? "1px solid red" : "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "14px",
                outline: "none",
                width: "100%"
              }}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && <div className="error-text">{errors.gender}</div>}
          </div>

          <div className="form-field">
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              className={errors.businessName ? "error" : ""}
            />
            {errors.businessName && <div className="error-text">{errors.businessName}</div>}
          </div>
          
          <div className="form-field">
            <input
              type="text"
              name="businessAddress"
              placeholder="Business Address"
              value={formData.businessAddress}
              onChange={handleChange}
              className={errors.businessAddress ? "error" : ""}
            />
            {errors.businessAddress && <div className="error-text">{errors.businessAddress}</div>}
          </div>
          
          <div className="form-field">
            <input
              type="text"
              name="businessRegistrationNumber"
              placeholder="Business Registration Number (Optional)"
              value={formData.businessRegistrationNumber}
              onChange={handleChange}
              className={errors.businessRegistrationNumber ? "error" : ""}
            />
            {errors.businessRegistrationNumber && <div className="error-text">{errors.businessRegistrationNumber}</div>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {/* MATCHED LINK BLOCK */}
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

export default VendorRegister2;
