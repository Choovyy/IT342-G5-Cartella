import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer, Slide } from "react-toastify";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import "./design/VendorLogin.css";
import authService from "../api/authService";

const VendorRegister2 = () => {
  const { state: basicData } = useLocation();
  const [formData, setFormData] = useState({
    gender: "",
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullData = { ...basicData, ...formData };

      if (fullData.dob) {
        const dobDate = new Date(fullData.dob);
        fullData.dob = dobDate.toISOString().split("T")[0];
      }

      if (fullData.gender) {
        fullData.gender = fullData.gender.toUpperCase();
      }

      const response = await authService.registerVendor(fullData);

      if (response.token) {
        sessionStorage.setItem("authToken", response.token);
        sessionStorage.setItem("username", fullData.username);
        sessionStorage.setItem("userId", response.userId);
        sessionStorage.setItem("vendorId", response.vendorId);
      }

      toast.success("Registration Successful", {
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
        navigate("/vendor-login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);

      toast.error(err.response?.data?.error || "An unexpected error occurred. Please try again later.", {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
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

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none",
              width: "93%",
              marginBottom: "10px",
            }}
          />

          <input
            type="text"
            name="businessAddress"
            placeholder="Business Address"
            value={formData.businessAddress}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none",
              width: "93%",
              marginBottom: "10px",
            }}
          />

          <input
            type="text"
            name="businessRegistrationNumber"
            placeholder="Business Registration Number (Optional)"
            value={formData.businessRegistrationNumber}
            onChange={handleChange}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "14px",
              outline: "none",
              width: "93%",
              marginBottom: "10px",
            }}
          />

          {/* Updated button section */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "14px",
                outline: "none",
                flex: 1,
                backgroundColor: "#ffffff",
                color: "#333333",
                cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                fontSize: "14px",
                outline: "none",
                flex: 1,
                backgroundColor: "#d9534f",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </div>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <p style={{ margin: "5px 0" }}>
              Already have a vendor account? <Link to="/vendor-login">Log In</Link>
            </p>
            <p style={{ margin: "5px 0" }}>
              <Link to="/login">Customer Log In</Link>
            </p>
          </div>
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

export default VendorRegister2;