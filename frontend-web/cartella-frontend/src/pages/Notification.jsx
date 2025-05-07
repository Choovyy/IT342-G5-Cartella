import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Modal, Button, Paper, Avatar, Divider,
  CircularProgress, Fade, Badge, Tooltip
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
import InfoIcon from "@mui/icons-material/Info";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DoneIcon from "@mui/icons-material/Done";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";

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

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      // Mark each unread notification as read one by one
      for (const notification of unreadNotifications) {
        await axios.put(
          `https://it342-g5-cartella.onrender.com/api/notifications/${notification.notificationId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
          }
        );
      }
      
      // Update state to reflect all notifications as read
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
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

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
  };

  const renderNotifications = () => {
    if (loading) return <p>Loading notifications...</p>;
    if (error) return <p>{error}</p>;
    if (notifications.length === 0) return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">No notifications available</Typography>
        <Typography variant="body2" color="text.secondary">When you receive notifications, they will appear here</Typography>
      </Box>
    );

    return notifications.map((notification) => {
      // Determine notification type and set appropriate icon and color
      let icon = <InfoIcon />;
      let color = "#2196F3"; // default blue
      let bgColor = `${color}15`; // very light shade of the color

      if (notification.message.includes("Order")) {
        if (notification.message.includes("PENDING")) {
          icon = <HourglassEmptyIcon />;
          color = "#FF9800"; // orange
        } else if (notification.message.includes("PROCESSING")) {
          icon = <LocalShippingIcon />;
          color = "#2196F3"; // blue
        } else if (notification.message.includes("SHIPPED")) {
          icon = <LocalShippingIcon />;
          color = "#9C27B0"; // purple
        } else if (notification.message.includes("DELIVERED") || notification.message.includes("COMPLETED")) {
          icon = <CheckCircleIcon />;
          color = "#4CAF50"; // green
        } else if (notification.message.includes("CANCELLED")) {
          icon = <CancelIcon />;
          color = "#F44336"; // red
        }
        bgColor = `${color}15`;
      } else if (notification.message.includes("Payment")) {
        icon = <CreditCardIcon />;
        color = "#D32F2F"; // red
        bgColor = `${color}15`;
      }

      const timeSince = getTimeSince(new Date(notification.createdAt));

      return (
        <Paper 
          key={notification.notificationId} 
          elevation={notification.isRead ? 0 : 2}
          sx={{ 
            mb: 2, 
            p: 2, 
            borderRadius: '12px',
            position: 'relative', 
            border: `1px solid ${notification.isRead ? '#e0e0e0' : color}`,
            backgroundColor: notification.isRead ? 'background.paper' : bgColor,
            transition: 'all 0.3s ease',
            '&:hover': { 
              transform: 'translateY(-2px)',
              boxShadow: 3 
            }
          }}
        >
          {!notification.isRead && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: color 
              }} 
            />
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: color, mr: 2 }}>
              {icon}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ mb: 1, pr: 3 }}>
                {notification.message}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {timeSince}
              </Typography>
              
              {notification.paymentDetails && (
                <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Payment:</strong> {notification.paymentDetails}
                  </Typography>
                </Box>
              )}
              
              {notification.orderDetails && (
                <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Order:</strong> {notification.orderDetails}
                  </Typography>
                </Box>
              )}
              
              {notification.trackingDetails && (
                <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Tracking:</strong> {notification.trackingDetails}
                  </Typography>
                </Box>
              )}
              
              {notification.estimatedDelivery && (
                <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Estimated Delivery:</strong> {notification.estimatedDelivery}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {notification.orderId && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/order/${notification.orderId}`)}
                    sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                  >
                    View Order
                  </Button>
                )}
                
                {notification.trackingDetails && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LocalShippingIcon />}
                    onClick={() => navigate(`/tracking/${notification.orderId}`)}
                    sx={{ borderColor: '#388e3c', color: '#388e3c' }}
                  >
                    Track Shipment
                  </Button>
                )}
                
                {notification.paymentDetails && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate(`/receipt/${notification.paymentId}`)}
                    sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                  >
                    View Receipt
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  variant={notification.isRead ? "text" : "outlined"}
                  color="primary"
                  disabled={notification.isRead}
                  onClick={() => markAsRead(notification.notificationId)}
                  startIcon={<DoneIcon />}
                >
                  {notification.isRead ? "Read" : "Mark as Read"}
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => deleteNotification(notification.notificationId)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      );
    });
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <div>
            <Typography variant="h4" component="h1">Notifications</Typography>
            <Typography variant="body1" color="text.secondary">
              View all your latest alerts and updates here
            </Typography>
          </div>
          <Box>
            <Tooltip title="Refresh notifications">
              <IconButton 
                onClick={fetchNotifications} 
                disabled={loading}
                sx={{ mr: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={markAllAsRead}
              disabled={loading || notifications.length === 0 || notifications.every(n => n.isRead)}
              startIcon={<DoneAllIcon />}
            >
              Mark all as read
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderNotifications()
        )}
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
