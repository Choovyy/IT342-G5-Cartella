import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Modal, Button
} from "@mui/material";
import axios from "axios";

import { ColorModeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

const Notification = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.get(
        `https://it342-g5-cartella.onrender.com/api/notifications/${userId}`,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        }
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `https://it342-g5-cartella.onrender.com/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `https://it342-g5-cartella.onrender.com/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        }
      );
      setNotifications((prev) =>
        prev.filter((notification) => notification.notificationId !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const logoSrc = mode === "light"
    ? "src/images/Cartella Logo (Light).jpeg"
    : "src/images/Cartella Logo (Dark2).jpeg";

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {[{ text: "Categories", path: "/dashboard", icon: <DashboardIcon /> },
          { text: "Cart", path: "/cart", icon: <ShoppingCartIcon /> },
          { text: "My Purchase", path: "/mypurchase", icon: <HistoryIcon /> },
          { text: "Notifications", path: "/notifications", icon: <NotificationsIcon /> },
          { text: "My Profile", path: "/profile", icon: <AccountCircleIcon /> },
        ].map(({ text, path, icon }) => (
          <ListItem button key={text} onClick={() => navigate(path)}>
            <IconButton sx={{ mr: 1, color: "inherit" }}>{icon}</IconButton>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <List>
        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Box>
  );

  const renderNotifications = () => {
    if (loading) return <p>Loading notifications...</p>;
    if (error) return <p>{error}</p>;
    if (notifications.length === 0) return <p>No notifications available.</p>;

    return notifications.map((notification) => (
      <div key={notification.notificationId} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
        <h4>{notification.message}</h4>
        <p><strong>Created At:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
        {notification.paymentDetails && (
          <p><strong>Payment:</strong> {notification.paymentDetails}</p>
        )}
        {notification.orderDetails && (
          <p><strong>Order:</strong> {notification.orderDetails}</p>
        )}
        {notification.trackingDetails && (
          <p><strong>Tracking:</strong> {notification.trackingDetails}</p>
        )}
        {notification.estimatedDelivery && (
          <p><strong>Estimated Delivery:</strong> {notification.estimatedDelivery}</p>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          {notification.orderId && (
            <button
              onClick={() => navigate(`/order/${notification.orderId}`)}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              View Order
            </button>
          )}
          {notification.trackingDetails && (
            <button
              onClick={() => navigate(`/tracking/${notification.orderId}`)}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#388e3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Track Shipment
            </button>
          )}
          {notification.paymentDetails && (
            <button
              onClick={() => navigate(`/receipt/${notification.paymentId}`)}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              View Receipt
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            onClick={() => markAsRead(notification.notificationId)}
            disabled={notification.isRead}
            style={{ padding: "0.5rem 1rem", backgroundColor: notification.isRead ? "#ccc" : "#0288d1", color: "#fff", border: "none", borderRadius: "4px", cursor: notification.isRead ? "not-allowed" : "pointer" }}
          >
            Mark as Read
          </button>
          <button
            onClick={() => deleteNotification(notification.notificationId)}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: mode === "dark" ? "#3A3A3A" : "#D32F2F", color: "#fff" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={logoSrc} alt="Logo" style={{ height: 40, marginRight: 10 }} />
            <Typography variant="h2" sx={{ fontFamily: "GDS Didot, serif", fontSize: "26px", marginRight: 3 }}>
              Cartella
            </Typography>
            <Box display="flex" alignItems="center" sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
              <IconButton onClick={handleSearch}><SearchIcon sx={{ color: "#1A1A1A" }} /></IconButton>
              <InputBase
                placeholder="Search items"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ flex: 1, color: "#000", "& input": { border: "none", outline: "none" } }}
              />
            </Box>
          </Box>
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
            color: mode === "light" ? "#000" : "#FFF",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main"
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          p: 3,
          mt: 8,
          color: mode === "light" ? "#000" : "#FFF",
        }}
      >
        <Typography variant="h4">Notifications</Typography>
        <Typography paragraph>View all your latest alerts and updates here.</Typography>
        {renderNotifications()}
      </Box>

      {/* Modal for Not Logged In */}
      <Modal
        open={isModalOpen}
        onClose={() => {}}
        aria-labelledby="not-logged-in-modal"
        aria-describedby="not-logged-in-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography id="not-logged-in-modal" variant="h6" component="h2">
            You must be logged in to access this page.
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#D32F2E",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#B71C1C",
              },
            }}
            onClick={handleLoginRedirect}
          >
            Log In
          </Button>
        </Box>
      </Modal>

      {/* Modal for Logout Confirmation */}
      <Modal
        open={isLogoutModalOpen}
        onClose={() => {}}
        aria-labelledby="logout-modal"
        aria-describedby="logout-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography id="logout-modal" variant="h6" component="h2">
            Do you want to log out?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#D32F2E",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#B71C1C",
                },
              }}
              onClick={handleLogout}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: "#ffffff",
                color: "#333333",
                border: "1px solid #ccc",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Notification;
