import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullData = { ...basicData, ...formData };

    try {
      const response = await axios.post("/api/vendors/register", fullData);
      setMessage(response.data.message);
      setError("");

      setTimeout(() => {
        navigate("/vendor-login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      setMessage("");
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
          {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

          <select
            name="gender"
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none"
            }}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="businessAddress"
            placeholder="Business Address"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="businessRegistrationNumber"
            placeholder="Business Registration Number (Optional)"
            onChange={handleChange}
          />

          <button type="submit">Register</button>

          {/* MATCHED LINK BLOCK */}
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

export default VendorRegister2;
