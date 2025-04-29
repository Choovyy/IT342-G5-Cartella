import React, { useContext, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputBase,
  Button,
  CircularProgress,
  Alert
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

const ViewProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    
    if (!authToken) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    if (!productId) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    // Fetch product details
    fetch(`https://it342-g5-cartella.onrender.com/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load product: " + err.message);
        setLoading(false);
      });
  }, [productId]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    navigate("/login");
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
          Product Details
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : product ? (
          <Box
            sx={{
              display: "flex",
              maxWidth: 900,
              margin: "auto",
              backgroundColor: mode === "light" ? "#f9f9f9" : "#2A2A2A",
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            {/* Left: Product Image */}
            <Box sx={{ flex: 1 }}>
              {product.imageUrl ? (
                <img
                  src={`https://it342-g5-cartella.onrender.com${product.imageUrl}`}
                  alt={product.name}
                  style={{ width: "100%", maxWidth: 300, borderRadius: 10 }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 300,
                    height: 300,
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
            </Box>

            {/* Right: Info */}
            <Box sx={{ flex: 1, pl: 2, display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" sx={{ mb: 1, mt: 2 }}>
                {product.name}
              </Typography>

              <Typography variant="h6" sx={{ mb: 1 }}>
                ₱ {product.price?.toLocaleString()}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {product.description}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Stock: {product.stockQuantity}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 12 }}>
                Category: {product.category}
              </Typography>

              <Box sx={{ mt: "auto" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/edit-product`, { state: { productId: product.productId } })}
                  sx={{ mr: 2 }}
                >
                  Edit Product
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    // TODO: Implement delete functionality
                    console.log("Delete product:", product.productId);
                  }}
                >
                  Delete Product
                </Button>
              </Box>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default ViewProduct;
