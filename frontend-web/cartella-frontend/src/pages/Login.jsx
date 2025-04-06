import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard"); // Redirect to dashboard if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/users/login", formData);
      

      // Save the token in sessionStorage
      sessionStorage.setItem("authToken", response.data.token);

      alert("Login Successful!");
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      console.error("Login error:", error.response?.data); // Debugging: Log the error
      alert(error.response?.data?.error || "Invalid credentials");
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend's Google OAuth2 login endpoint
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
      <button onClick={handleGoogleLogin} style={{ marginTop: "10px" }}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;