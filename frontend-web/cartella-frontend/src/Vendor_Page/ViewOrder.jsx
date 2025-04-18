// ViewOrder.jsx
import React, { useContext, useState } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Paper, Divider,
  Button, MenuItem, Select, FormControl, InputLabel
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

const ViewOrder = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [status, setStatus] = useState("");

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: mode === "dark" ? "#3A3A3A" : "#D32F2F",
          color: "#fff",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={logoSrc} alt="Logo" style={{ height: 40, marginRight: 10 }} />
            <Typography variant="h2" sx={{ fontSize: "26px", marginRight: 3, fontFamily: "GDS Didot, serif" }}>
              Cartella
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}
            >
              <IconButton onClick={handleSearch}>
                <SearchIcon sx={{ color: "#1A1A1A" }} />
              </IconButton>
              <InputBase
                placeholder="Search items"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  flex: 1,
                  color: "#000",
                  "& input": {
                    border: "none",
                    outline: "none",
                  },
                }}
              />
            </Box>
          </Box>
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
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
        <Typography variant="h4" sx={{ mb: 14}}>
          Order Information
        </Typography>

        <Paper elevation={2} sx={{ p: 3, position: "relative" }}>
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
            {/* Customer Info */}
            <Box flex={1} minWidth="300px">
              <Typography variant="h5" sx={{ mb: 3}}>
                Customer Information
              </Typography>
              <Typography variant="subtitle1"><strong>Name:</strong> Juan Dela Cruz</Typography>
              <Typography variant="subtitle1"><strong>Address:</strong> 123 Barangay St., Quezon City, PH</Typography>
              <Typography variant="subtitle1"><strong>Contact Number:</strong> +63 912 345 6789</Typography>
              <Typography variant="subtitle1"><strong>Gender:</strong> Male</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

            {/* Order Info */}
            <Box flex={2}>
              <Typography variant="h5" sx={{ mb: 3}}>
                Order Details
              </Typography>

              <Box display="flex" alignItems="flex-start" gap={3}>
                <img
                  src="src/images/longsleeve.png"
                  alt="Nike Longsleeve"
                  style={{ width: 160, height: "auto", borderRadius: 8 }}
                />
                <Box flex={1}>
                  <Typography variant="h6">Nike Longsleeve</Typography>
                  <Typography variant="body1" sx={{ mb: 3}}>
                    Comfort fit, breathable fabric, ideal for cool weather workouts.
                  </Typography>

                  <Typography variant="subtitle1"><strong>Price:</strong> ₱1,499.00</Typography>
                  <Typography variant="subtitle1"><strong>Quantity:</strong> 1</Typography>
                  <Typography variant="subtitle1"><strong>Order ID:</strong> ORD-20250418-XYZ</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Tracking ID:</strong> TRK-123456789-PH
                  </Typography>
                </Box>
              </Box>

              {/* Confirm Button (positioned bottom-right) */}
              <Box display="flex" justifyContent="flex-end" mt={3}>
                {!orderConfirmed ? (
                  <Button
                    onClick={handleConfirmOrder}
                    sx={{
                      width: 160,
                      height: 40,
                      backgroundColor: "#D32F2E",
                      color: "#FFFFFF",
                      textTransform: "none",
                      fontSize: "16px",
                      "&:hover": {
                        backgroundColor: "#b71c1c",
                      },
                    }}
                  >
                    Confirm Order
                  </Button>
                ) : (
                  <Box display="flex" alignItems="center" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Status</InputLabel>
                      <Select value={status} onChange={handleStatusChange} label="Status">
                        <MenuItem value="warehouse">At Warehouse</MenuItem>
                        <MenuItem value="cityHub">At City Hub</MenuItem>
                        <MenuItem value="outForDelivery">Out for Delivery</MenuItem>
                        <MenuItem value="delivered">Parcel Delivered</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      sx={{
                        height: 40,
                        backgroundColor: "#1976d2",
                        color: "#FFFFFF",
                        textTransform: "none",
                        px: 3,
                        fontSize: "14px",
                        "&:hover": {
                          backgroundColor: "#115293",
                        },
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
      </Box>
    </Box>
  );
};

export default ViewOrder;
