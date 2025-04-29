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

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const usernameRef = useRef(null);
  const dobRef = useRef(null);

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setServerError("");

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRef.current) {
        if (!emailRegex.test(value)) {
          emailRef.current.setCustomValidity("Please enter a valid email address.");
        } else {
          emailRef.current.setCustomValidity("");
        }
        emailRef.current.reportValidity();
      }
    }

    if (name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (passwordRef.current) {
        if (!passwordRegex.test(value)) {
          passwordRef.current.setCustomValidity(
            "Password must be 8+ characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character."
          );
        } else {
          passwordRef.current.setCustomValidity("");
        }
        passwordRef.current.reportValidity();
      }
    }

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (phoneRef.current) {
        if (numericValue.length !== 11) {
          phoneRef.current.setCustomValidity("Phone number must be exactly 11 digits.");
        } else {
          phoneRef.current.setCustomValidity("");
        }
        phoneRef.current.reportValidity();
      }
      setFormData((prev) => ({ ...prev, phone: numericValue }));
    }

    if (name === "dob") {
      if (dobRef.current) {
        if (!value) {
          dobRef.current.setCustomValidity("Date of birth is required.");
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) {
            dobRef.current.setCustomValidity("You must be at least 18 years old to register.");
          } else {
            dobRef.current.setCustomValidity("");
          }
        }
        dobRef.current.reportValidity();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");

    if (
      !emailRef.current.checkValidity() ||
      !passwordRef.current.checkValidity() ||
      !phoneRef.current.checkValidity() ||
      !usernameRef.current.checkValidity() ||
      !dobRef.current.checkValidity()
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
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

          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            ref={usernameRef}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            ref={passwordRef}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            ref={emailRef}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            ref={phoneRef}
            value={formData.phone}
            maxLength="11"
            required
          />

          <div className="form-field" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", marginBottom: "10px" }}>
            <label htmlFor="dob" style={{ fontSize: "14px", minWidth: "80px" }}>Birth Date</label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              ref={dobRef}
              required
              style={{ flex: 1 }}
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Next"}
          </button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '5px 0' }}>
              Already have a vendor account? <Link to="/vendor-login">Log In</Link>
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
