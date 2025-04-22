import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Grid, Card, CardMedia, 
  CardContent, CircularProgress, Alert, Button, Rating
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { ColorModeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import LightLogo from "../images/Cartella Logo (Light).jpeg";
import DarkLogo from "../images/Cartella Logo (Dark2).jpeg";

const drawerWidth = 240;

const MenAccessories = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    // Fetch products for Men's Accessories category
    fetch("http://localhost:8080/api/products/category/Men's%20Accessories", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });

    // Verify authentication
    axios.get("/login", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => {
      console.error("Error verifying auth:", error);
      alert("Session expired. Please log in again.");
      sessionStorage.removeItem("authToken");
      navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchText, products]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleAddToCart = async (productId) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("authToken");
  
    if (!userId || !token) {
      alert("You must be logged in to add items to cart.");
      return;
    }
  
    try {
      // Try to add product to cart
      await axios.post(
        `http://localhost:8080/api/cart/${userId}/add/${productId}?quantity=1`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // If cart not found, create cart then retry
      if (
        error.response &&
        (error.response.status === 404 ||
          (error.response.data && error.response.data.message && error.response.data.message.includes("Cart not found")))
      ) {
        try {
          await axios.post(
            `http://localhost:8080/api/cart/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Retry adding product
          await axios.post(
            `http://localhost:8080/api/cart/${userId}/add/${productId}?quantity=1`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Product added to cart!");
        } catch (err) {
          console.error("Error creating cart or adding product:", err);
          if (err.response && err.response.data && err.response.data.message) {
            alert(err.response.data.message);
          } else {
            alert("Failed to add product to cart. Please try again.");
          }
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        // Display the specific error message from the server
        alert(error.response.data.message);
      } else {
        alert("Failed to add product to cart. Please try again.");
      }
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const logoSrc = mode === "light" ? LightLogo : DarkLogo;

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {[
          { text: "Categories", path: "/dashboard", icon: <DashboardIcon /> },
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
        <ListItem button onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
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
            <Typography
              variant="h2"
              sx={{
                fontFamily: "GDS Didot, serif",
                fontSize: "26px",
                color: "inherit",
                marginRight: 3,
              }}
            >
              Cartella
            </Typography>

            {/* Search Bar */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                px: 2,
                width: 400,
              }}
            >
              <IconButton onClick={handleSearch}>
                <SearchIcon sx={{ color: "#1A1A1A" }} />
              </IconButton>
              <InputBase
                placeholder="Search items"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

          {/* Theme Toggle */}
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          p: 3,
          mt: 8,
          color: mode === "light" ? "#000" : "#FFF",
        }}
      >
        <Typography variant="h4" gutterBottom>Men's Accessories</Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : filteredProducts.length === 0 ? (
          <Typography align="center" sx={{ mt: 10 }}>
            No products found in this category.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
                <Card
                  sx={{
                    height: 380,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: mode === "light" 
                        ? "0 8px 16px rgba(0,0,0,0.1)" 
                        : "0 8px 16px rgba(0,0,0,0.3)",
                    },
                  }}
                  onClick={() => handleProductClick(product.productId)}
                >
                  <Box sx={{ width: "100%", position: "relative" }}>
                    {product.imageUrl ? (
                      <CardMedia
                        component="img"
                        image={`http://localhost:8080${product.imageUrl}`}
                        alt={product.name}
                        sx={{
                          height: 200,
                          width: "100%",
                          objectFit: "contain",
                          borderRadius: 1,
                          bgcolor: mode === "light" ? "#fff" : "#1a1a1a",
                          p: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: mode === "light" ? "#e0e0e0" : "#333",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No Image Available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <CardContent sx={{ width: "100%", pb: 1, pt: 2 }}>
                    <Typography 
                      variant="h6" 
                      noWrap 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: "1rem",
                        mb: 0.5,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        height: "2.5em",
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        ₱ {product.price?.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          bgcolor: mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        Stock: {product.stockQuantity}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Rating value={4.5} precision={0.5} readOnly size="small" />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.productId);
                        }}
                        sx={{
                          bgcolor: "#D32F2F",
                          color: "#fff",
                          "&:hover": {
                            bgcolor: "#b71c1c",
                          },
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MenAccessories;
