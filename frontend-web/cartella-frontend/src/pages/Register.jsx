import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [validationMessages, setValidationMessages] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phoneNumber to allow only numbers and limit to 11 digits
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (numericValue.length > 11) return; // Limit to 11 digits
      setFormData({ ...formData, [name]: numericValue });

      // Real-time validation for phone number
      if (numericValue.length < 11) {
        setValidationMessages((prev) => ({
          ...prev,
          phoneNumber: "Phone number must be exactly 11 digits.",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          phoneNumber: "",
        }));
      }
      return;
    }

    // Real-time validation for email
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationMessages((prev) => ({
          ...prev,
          email: "Please enter a valid email address.",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          email: "",
        }));
      }
    }

    // Real-time validation for password
    if (name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(value)) {
        setValidationMessages((prev) => ({
          ...prev,
          password:
            "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
        }));
      } else {
        setValidationMessages((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (validationMessages.email || validationMessages.password || validationMessages.phoneNumber) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/users/register", formData);
      console.log("Registration response:", response.data);
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      alert(error.response?.data?.error || "An error occurred during registration.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
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
        {validationMessages.email && <p style={{ color: "red" }}>{validationMessages.email}</p>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        {validationMessages.password && <p style={{ color: "red" }}>{validationMessages.password}</p>}
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          maxLength="11" // Prevent input beyond 11 digits
          onChange={handleChange}
          value={formData.phoneNumber} // Ensure controlled input
          required
        />
        {validationMessages.phoneNumber && <p style={{ color: "red" }}>{validationMessages.phoneNumber}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Register;