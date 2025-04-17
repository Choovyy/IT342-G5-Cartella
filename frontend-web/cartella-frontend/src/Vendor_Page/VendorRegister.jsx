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
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
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
