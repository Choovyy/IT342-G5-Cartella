import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      try {
        sessionStorage.setItem("authToken", token); // Save token
        
        navigate("/dashboard"); // Redirect to dashboard
      } catch (error) {
        console.error("Error storing token:", error); // Debugging: Log the error
        alert("An error occurred while processing your login. Please try again.");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default OAuthSuccess;