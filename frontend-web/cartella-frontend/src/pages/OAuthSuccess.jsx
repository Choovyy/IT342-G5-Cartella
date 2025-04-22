import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debug: Log the current URL and location
    console.log("Current URL:", window.location.href);
    console.log("Location object:", location);
    
    // Check for error parameter in URL
    const errorParam = new URLSearchParams(location.search).get("error");
    if (errorParam) {
      console.error("Error parameter found:", errorParam);
      setError(`Authentication error: ${errorParam}`);
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const userId = params.get("userId");
    
    // Debug: Log the parameters
    console.log("Token:", token);
    console.log("Email:", email);
    console.log("UserId:", userId);

    if (token && email && userId) {
      try {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("userId", userId);
        console.log("Successfully stored token, email, and userId in sessionStorage");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error storing OAuth session:", error);
        setError("Failed to store authentication data. Please try logging in again.");
      }
    } else {
      console.error("Missing parameters:", { token, email, userId });
      setError("Missing required authentication data. Please try logging in again.");
    }
  }, [navigate, location]);

  if (error) {
    return (
      <div className="oauth-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="oauth-loading">
      <h2>Processing your login...</h2>
      <p>Please wait while we redirect you to the dashboard.</p>
    </div>
  );
};

export default OAuthSuccess;