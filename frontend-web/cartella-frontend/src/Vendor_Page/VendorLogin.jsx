import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const VendorLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/vendors/login", credentials);
      setMessage(response.data.message);
      setError("");

      // Save token and user details in sessionStorage
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", credentials.username);
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("vendorId", response.data.vendorId);

      // Redirect to VendorDashboard
      navigate("/vendor-dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Vendor Login</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/vendor-register">Register here</Link>
      </p>
    </div>
  );
};

export default VendorLogin;