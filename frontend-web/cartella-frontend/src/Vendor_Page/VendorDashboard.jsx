import React, { useEffect, useState } from "react";

const VendorDashboard = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    userId: "",
    vendorId: "",
  });

  useEffect(() => {
    // Fetch user details from localStorage
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");
    const vendorId = sessionStorage.getItem("vendorId");

    setUserDetails({ username, userId, vendorId });
  }, []);

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      <div>
        <h2>Welcome, {userDetails.username || "Vendor"}!</h2>
        <p><strong>User ID:</strong> {userDetails.userId || "N/A"}</p>
        <p><strong>Vendor ID:</strong> {userDetails.vendorId || "N/A"}</p>
      </div>
    </div>
  );
};

export default VendorDashboard;