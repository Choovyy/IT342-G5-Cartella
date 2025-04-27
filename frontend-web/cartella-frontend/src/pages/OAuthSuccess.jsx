import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import userService from "../api/userService";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug: Log the current URL and location
    console.log("Current URL:", window.location.href);
    console.log("Location object:", location);
    
    const handleOAuthSuccess = async () => {
      try {
        // Check for error parameter in URL
        const errorParam = new URLSearchParams(location.search).get("error");
        if (errorParam) {
          console.error("Error parameter found:", errorParam);
          setError(`Authentication error: ${errorParam}`);
          setLoading(false);
          return;
        }
        
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const email = params.get("email");
        const userId = params.get("userId");
        const role = params.get("role");
        
        // Debug: Log the parameters
        console.log("Token:", token);
        console.log("Email:", email);
        console.log("UserId:", userId);
        console.log("Role:", role);

        if (token && email && userId) {
          try {
            sessionStorage.setItem("authToken", token);
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("userId", userId);
            console.log("Successfully stored token, email, and userId in sessionStorage");
            
            // Try to get user information using email
            try {
              const userData = await userService.getUserByEmail(email);
              console.log("User data retrieved:", userData);
              
              if (userData.username) {
                sessionStorage.setItem("username", userData.username);
              }
              
              // If user is a vendor, store vendorId
              if (userData.vendorId) {
                sessionStorage.setItem("vendorId", userData.vendorId);
              }
            } catch (err) {
              console.error("Error fetching user data:", err);
              // Continue anyway, as we have the token
            }
            
            // Redirect based on role
            if (role === "VENDOR") {
              navigate("/vendor-dashboard");
            } else {
              navigate("/dashboard");
            }
          } catch (error) {
            console.error("Error storing OAuth session:", error);
            setError("Failed to store authentication data. Please try logging in again.");
            setLoading(false);
          }
        } else {
          console.error("Missing parameters:", { token, email, userId });
          setError("Missing required authentication data. Please try logging in again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in OAuth flow:", err);
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    };
    
    handleOAuthSuccess();
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