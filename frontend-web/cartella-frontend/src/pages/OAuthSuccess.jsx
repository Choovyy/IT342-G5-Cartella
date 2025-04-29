import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug: Log the current URL and location
    console.log("Current URL:", window.location.href);
    console.log("Location object:", location);
    
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
    
    // Debug: Log the parameters
    console.log("Token:", token);
    console.log("Email:", email);
    console.log("UserId:", userId);

    if (token && email && userId) {
      try {
        // Store auth data in sessionStorage
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("userId", userId);
        console.log("Successfully stored token, email, and userId in sessionStorage");
        
        // Set a small timeout to ensure storage completes before redirect
        setTimeout(() => {
          setLoading(false);
          navigate("/dashboard");
        }, 500);
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
  }, [navigate, location]);

  if (error) {
    return (
      <div className="oauth-error container mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="oauth-loading container mx-auto my-10 p-8 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Processing your login...</h2>
      <p className="mb-4">Please wait while we redirect you to the dashboard.</p>
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default OAuthSuccess;