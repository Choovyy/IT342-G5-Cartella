import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const usernameRef = useRef(null);
  const dobRef = useRef(null);

  const navigate = useNavigate();

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
    navigate("/vendor-register-step2", { state: formData });
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

        <form onSubmit={handleNext}>
          <h2>VENDOR REGISTER</h2>

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
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
          />

          {/* Birth Date - Inline Label and Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", marginBottom: "10px" }}>
            <label htmlFor="dob" style={{ fontSize: "14px", minWidth: "80px" }}>Birth Date</label>
            <input
              type="date"
              name="dob"
              id="dob"
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
          </div>

          <button type="submit">Next</button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '5px 0' }}>
              Already have a vendor account?
              <a href="/vendor-login"> Log In</a>
            </p>
            <p style={{ margin: '5px 0' }}>
              <a href="/login">Customer Log In</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;