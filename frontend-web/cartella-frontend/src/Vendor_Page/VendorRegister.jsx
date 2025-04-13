import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/vendors/register", formData);
      setMessage(response.data.message);
      setError("");

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/vendor-login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Vendor Registration</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
        <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required />
        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input type="text" name="businessName" placeholder="Business Name" onChange={handleChange} required />
        <input type="text" name="businessAddress" placeholder="Business Address" onChange={handleChange} required />
        <input type="text" name="businessRegistrationNumber" placeholder="Business Registration Number" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default VendorRegister;