import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../images/Cartella Logo (Dark).jpeg";
import logoLight from "../images/Cartella Logo (Light2).jpeg";
import "./design/Login.css";
import authService from "../api/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 11) return;
      setFormData((prev) => ({ ...prev, phoneNumber: numericValue }));

      if (phoneRef.current) {
        if (numericValue.length !== 11) {
          phoneRef.current.setCustomValidity("Phone number must be exactly 11 digits.");
        } else {
          phoneRef.current.setCustomValidity("");
        }
        phoneRef.current.reportValidity();
      }
      return;
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFormData((prev) => ({ ...prev, email: value }));
      if (emailRef.current) {
        if (!emailRegex.test(value)) {
          emailRef.current.setCustomValidity("Please enter a valid email address.");
        } else {
          emailRef.current.setCustomValidity("");
        }
        emailRef.current.reportValidity();
      }
      return;
    }

    if (name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      setFormData((prev) => ({ ...prev, password: value }));
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
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !emailRef.current.checkValidity() ||
      !passwordRef.current.checkValidity() ||
      !phoneRef.current.checkValidity()
    ) {
      return;
    }

    try {
      await authService.registerUser(formData);

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
        navigate("/login");
      }, 3000); // same 3s delay as login
    } catch (error) {
      console.error("Register error:", error.response?.data);

      toast.error(error.response?.data?.error || "An error occurred during registration", {
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
            ref={emailRef}
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
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            maxLength="11"
            onChange={handleChange}
            value={formData.phoneNumber}
            ref={phoneRef}
            required
          />
          <button type="submit">Sign Up</button>
          <p>
            Already have an account? <a href="/login">Log In</a>
          </p>
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

export default Register;