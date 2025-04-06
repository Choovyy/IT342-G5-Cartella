import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    console.log("Retrieved Token:", token); // Debugging: Log the token

    if (!token) {
      alert("You must be logged in to access the dashboard.");
      navigate("/login");
      return;
    }

    // Fetch user info from the backend with Authorization header
    axios
      .get("/login", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      })
      .then((response) => {
        console.log("User info response:", response.data); // Debugging: Log the response
        setUsername(response.data.username); // Set the username
      })
      .catch((error) => {
        console.error("Error fetching user info:", error.response || error.message); // Debugging: Log the error
        alert("Failed to fetch user info. Please log in again.");
        sessionStorage.removeItem("authToken");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>
      <button
        onClick={() => {
          sessionStorage.removeItem("authToken"); // Clear token on logout
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;