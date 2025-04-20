// ViewOrder.jsx
import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Paper, Divider,
  Button, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { ColorModeContext } from "../ThemeContext";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const drawerWidth = 240;

const ViewOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    
    if (!authToken) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Fetch order details
    fetch(`http://localhost:8080/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch order");
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setOrderConfirmed(data.status !== "PENDING");
        setStatus(data.status);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load order: " + err.message);
        setLoading(false);
      });
  }, [orderId]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    navigate("/login");
  };

  const handleConfirmOrder = () => {
    const authToken = sessionStorage.getItem("authToken");
    
    fetch(`http://localhost:8080/api/orders/${orderId}/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to confirm order");
        return res.json();
      })
      .then(data => {
        setOrderConfirmed(true);
        setStatus(data.status);
      })
      .catch(err => {
        setError("Failed to confirm order: " + err.message);
      });
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    const authToken = sessionStorage.getItem("authToken");
    
    fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then(data => {
        setStatus(newStatus);
      })
      .catch(err => {
        setError("Failed to update status: " + err.message);
      });
  };

  const logoSrc = mode === "light"
    ? "src/images/Cartella Logo (Light).jpeg"
    : "src/images/Cartella Logo (Dark2).jpeg";

  const drawerItems = [
    { text: "Sales Overview", icon: <AssessmentIcon />, path: "/vendor-dashboard" },
    { text: "Products", icon: <InventoryIcon />, path: "/vendor-products" },
    { text: "Orders", icon: <ListAltIcon />, path: "/vendor-orders" },
    { text: "My Profile", icon: <AccountCircleIcon />, path: "/vendor-profile" },
  ];

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {drawerItems.map(({ text, icon, path }) => (
          <ListItem button key={text} onClick={() => navigate(path)}>
            <IconButton sx={{ mr: 1, color: "inherit" }}>{icon}</IconButton>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <List>
        <ListItem button onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          color: mode === "light" ? "#000" : "#FFF",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          p: 3,
          mt: 8,
          color: mode === "light" ? "#000" : "#FFF",
          overflow: "auto",
          height: "92vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 7 }}>
          Order Information
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : order ? (
          <Paper elevation={2} sx={{ p: 3, position: "relative" }}>
            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
              {/* Customer Info */}
              <Box flex={1} minWidth="300px">
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Customer Information
                </Typography>
                <Typography variant="subtitle1"><strong>Name:</strong> {order.customer.name}</Typography>
                <Typography variant="subtitle1"><strong>Address:</strong> {order.shippingAddress}</Typography>
                <Typography variant="subtitle1"><strong>Contact Number:</strong> {order.customer.phone}</Typography>
                <Typography variant="subtitle1"><strong>Email:</strong> {order.customer.email}</Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

              {/* Order Info */}
              <Box flex={2}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Order Details
                </Typography>

                <Box display="flex" alignItems="flex-start" gap={3}>
                  {order.product.imageUrl ? (
                    <img
                      src={`http://localhost:8080${order.product.imageUrl}`}
                      alt={order.product.name}
                      style={{ width: 160, height: "auto", borderRadius: 8 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 160,
                        height: 160,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#eee",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption">No Image</Typography>
                    </Box>
                  )}
                  <Box flex={1}>
                    <Typography variant="h6">{order.product.name}</Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {order.product.description}
                    </Typography>

                    <Typography variant="subtitle1"><strong>Price:</strong> ₱{order.product.price.toLocaleString()}</Typography>
                    <Typography variant="subtitle1"><strong>Quantity:</strong> {order.quantity}</Typography>
                    <Typography variant="subtitle1"><strong>Order ID:</strong> {order.orderId}</Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Tracking ID:</strong> {order.trackingId || "Not yet assigned"}
                    </Typography>
                  </Box>
                </Box>

                {/* Confirm Button (positioned bottom-right) */}
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  {!orderConfirmed ? (
                    <Button
                      onClick={handleConfirmOrder}
                      variant="contained"
                      color="primary"
                      sx={{
                        width: 160,
                        height: 40,
                        textTransform: "none",
                        fontSize: "16px",
                      }}
                    >
                      Confirm Order
                    </Button>
                  ) : (
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={status} onChange={handleStatusChange} label="Status">
                          <MenuItem value="WAREHOUSE">At Warehouse</MenuItem>
                          <MenuItem value="CITY_HUB">At City Hub</MenuItem>
                          <MenuItem value="OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
                          <MenuItem value="DELIVERED">Parcel Delivered</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleStatusChange}
                        sx={{
                          height: 40,
                          textTransform: "none",
                          px: 3,
                          fontSize: "14px",
                        }}
                      >
                        Save Status
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : null}
      </Box>
    </Box>
  );
};

export default ViewOrder;
