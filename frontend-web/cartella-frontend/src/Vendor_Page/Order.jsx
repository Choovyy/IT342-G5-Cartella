import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Card, CardContent, CardActionArea,
  CircularProgress, Alert
} from "@mui/material";

import { useNavigate } from "react-router-dom";
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

const Order = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    const vendorId = sessionStorage.getItem("vendorId");
    
    if (!authToken || !vendorId) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    // Fetch orders
    fetch(`http://localhost:8080/api/orders/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load orders: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleCardClick = (orderId) => {
    navigate(`/vendor-view-order/${orderId}`);
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
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 5 }}>{error}</Alert>
        ) : orders.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 5 }}>
            No orders found
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2} mt={5}>
            {orders.map(order => (
              <Card
                key={order.orderId}
                sx={{ bgcolor: mode === "light" ? "#f4f4f4" : "#2a2a2a" }}
              >
                <CardActionArea onClick={() => handleCardClick(order.orderId)}>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, height: "100%" }}>
                    <Box>
                      {order.product.imageUrl ? (
                        <img
                          src={`http://localhost:8080${order.product.imageUrl}`}
                          alt={order.product.name}
                          style={{ width: 60, height: 60, objectFit: "contain" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#eee",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption">No Image</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body1">
                        A customer has ordered {order.quantity} <strong>{order.product.name}</strong> for <strong>₱{order.product.price.toLocaleString()}</strong>, please prepare the item for delivery.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Order ID: {order.orderId} • Status: {order.status}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Order;
