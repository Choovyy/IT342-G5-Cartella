import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer, Slide } from "react-toastify";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Grid, Card, CardMedia, 
  CardContent, CircularProgress, Alert, Button, Rating, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, TextField, Modal
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [productQuantities, setProductQuantities] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    // Fetch products for Men's Accessories category
    fetch("https://it342-g5-cartella.onrender.com/api/products/category/Men's%20Accessories", {
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
      sessionStorage.removeItem("authToken");
      setIsModalOpen(true);
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
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleAddToCart = async (productId, productQuantity = 1) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("authToken");
  
    if (!userId || !token) {
      toast.error("You must be logged in to add items to cart.", {
        position: "bottom-right",
        closeButton: false,
        autoClose: 2000,
        style: {
          backgroundColor: "#ffffff",
          color: "#ff3333",
          border: "1px solid #cccccc",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "8px",
          pointerEvents: "none",
        }
      });
      return;
    }

    // Validate quantity
    if (productQuantity < 1) {
      toast.error("Quantity must be at least 1", {
        position: "bottom-right",
        closeButton: false,
        autoClose: 2000,
        style: {
          backgroundColor: "#ffffff",
          color: "#ff3333",
          border: "1px solid #cccccc",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "8px",
          pointerEvents: "none",
        }
      });
      return;
    }
  
    try {
      // Try to add product to cart
      await axios.post(
        `https://it342-g5-cartella.onrender.com/api/cart/${userId}/add/${productId}?quantity=${productQuantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Product added to cart!", {
        position: "bottom-right",
        closeButton: false,
        autoClose: 2000,
        style: {
          backgroundColor: "#ffffff",
          color: "#333333",
          border: "1px solid #cccccc",
          fontSize: "14px",
          padding: "10px 15px",
          borderRadius: "8px",
          pointerEvents: "none",
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      if (
        error.response &&
        (error.response.status === 404 ||
          (error.response.data && error.response.data.message && error.response.data.message.includes("Cart not found")))
      ) {
        try {
          await axios.post(
            `https://it342-g5-cartella.onrender.com/api/cart/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Retry adding product
          await axios.post(
            `https://it342-g5-cartella.onrender.com/api/cart/${userId}/add/${productId}?quantity=${productQuantity}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Product added to cart!", {
            position: "bottom-right",
            closeButton: false,
            autoClose: 2000,
            style: {
              backgroundColor: "#ffffff",
              color: "#333333",
              border: "1px solid #cccccc",
              fontSize: "14px",
              padding: "10px 15px",
              borderRadius: "8px",
              pointerEvents: "none",
            }
          });
        } catch (err) {
          console.error("Error creating cart or adding product:", err);
          if (err.response && err.response.data && err.response.data.message) {
            toast.error(err.response.data.message, {
              position: "bottom-right",
              closeButton: false,
              autoClose: 2000,
              style: {
                backgroundColor: "#ffffff",
                color: "#ff3333",
                border: "1px solid #cccccc",
                fontSize: "14px",
                padding: "10px 15px",
                borderRadius: "8px",
                pointerEvents: "none",
              }
            });
          } else {
            toast.error("Failed to add product to cart. Please try again.", {
              position: "bottom-right",
              closeButton: false,
              autoClose: 2000,
              style: {
                backgroundColor: "#ffffff",
                color: "#ff3333",
                border: "1px solid #cccccc",
                fontSize: "14px",
                padding: "10px 15px",
                borderRadius: "8px",
                pointerEvents: "none",
              }
            });
          }
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, {
          position: "bottom-right",
          closeButton: false,
          autoClose: 2000,
          style: {
            backgroundColor: "#ffffff",
            color: "#ff3333",
            border: "1px solid #cccccc",
            fontSize: "14px",
            padding: "10px 15px",
            borderRadius: "8px",
            pointerEvents: "none",
          }
        });
      } else {
        toast.error("Failed to add product to cart. Please try again.", {
          position: "bottom-right",
          closeButton: false,
          autoClose: 2000,
          style: {
            backgroundColor: "#ffffff",
            color: "#ff3333",
            border: "1px solid #cccccc",
            fontSize: "14px",
            padding: "10px 15px",
            borderRadius: "8px",
            pointerEvents: "none",
          }
        });
      }
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // Ensure quantity is at least 1 and not more than stock
    const product = products.find(p => p.productId === productId);
    if (product) {
      const validQuantity = Math.max(1, Math.min(newQuantity, product.stockQuantity));
      setProductQuantities({
        ...productQuantities,
        [productId]: validQuantity
      });
    }
  };

  const handleDialogQuantityChange = (newQuantity) => {
    // Ensure quantity is at least 1 and not more than stock
    if (selectedProduct) {
      const validQuantity = Math.max(1, Math.min(newQuantity, selectedProduct.stockQuantity));
      setQuantity(validQuantity);
    }
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
        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
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
      <Box component="main" sx={{
        flexGrow: 1,
        bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
        p: 3,
        mt: 8,
        color: mode === "light" ? "#000" : "#FFF",
        height: "92vh",
        overflow: "hidden"
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: mode === "light" ? "#000" : "#FFF",
              p: 0,
              mr: 2
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Men's Accessories
          </Typography>
        </Box>

        <Box sx={{
          flex: 1,
          overflowY: "auto",
          maxWidth: "1400px",
          mx: "auto",
          width: "100%",
          px: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: mode === "dark" ? "#2A2A2A" : "#f0f0f0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: mode === "dark" ? "#555" : "#D32F2F",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: mode === "dark" ? "#777" : "#B71C1C",
            },
          },
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : filteredProducts.length === 0 ? (
            <Typography align="center" sx={{ mt: 7 }}>
              No products found in this category.
            </Typography>
          ) : (
            <Grid container spacing={3} sx={{ py: 2 }}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
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
                    onClick={() => handleProductClick(product)}
                  >
                    <Box sx={{ width: "100%", position: "relative" }}>
                      {product.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={`https://it342-g5-cartella.onrender.com${product.imageUrl}`}
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = productQuantities[product.productId] || 1;
                              handleQuantityChange(product.productId, currentQty - 1);
                            }}
                            sx={{ color: mode === "light" ? "#D32F2F" : "#ff6b6b" }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ width: '30px', textAlign: 'center' }}>
                            {productQuantities[product.productId] || 1}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = productQuantities[product.productId] || 1;
                              handleQuantityChange(product.productId, currentQty + 1);
                            }}
                            sx={{ color: mode === "light" ? "#D32F2F" : "#ff6b6b" }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<ShoppingCartIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product.productId, productQuantities[product.productId] || 1);
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

          {/* Product Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
                color: mode === "light" ? "#000" : "#FFF",
                borderRadius: 2,
              }
            }}
          >
            {selectedProduct && (
              <>
                <DialogTitle sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  pb: 1
                }}>
                  <Typography variant="h5" component="div">
                    {selectedProduct.name}
                  </Typography>
                  <IconButton onClick={handleCloseDialog} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      {selectedProduct.imageUrl ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: 300,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: mode === "light" ? "#f5f5f5" : "#333",
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={`https://it342-g5-cartella.onrender.com${selectedProduct.imageUrl}`}
                            alt={selectedProduct.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 300,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: mode === "light" ? "#e0e0e0" : "#333",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No Image Available
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {selectedProduct.description}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Vendor
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StorefrontIcon sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            {selectedProduct.vendorBusinessName || "Unknown Vendor"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Price
                        </Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                          ₱ {selectedProduct.price?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Stock
                        </Typography>
                        <Typography variant="body1" color={selectedProduct.stockQuantity <= 0 ? "error.main" : "text.primary"}>
                          {selectedProduct.stockQuantity <= 0 
                            ? "Sold Out" 
                            : `${selectedProduct.stockQuantity} units available`}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Rating
                        </Typography>
                        <Rating value={selectedProduct.rating || 0} precision={0.5} readOnly />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Quantity
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDialogQuantityChange(quantity - 1)}
                            disabled={quantity <= 1 || selectedProduct.stockQuantity <= 0}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body1" sx={{ mx: 2 }}>
                            {quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDialogQuantityChange(quantity + 1)}
                            disabled={quantity >= selectedProduct.stockQuantity || selectedProduct.stockQuantity <= 0}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => {
                      const userId = sessionStorage.getItem("userId");
                      const token = sessionStorage.getItem("authToken");
                      
                      if (!userId || !token) {
                        toast.error("You must be logged in to add items to cart.", {
                          position: "bottom-right",
                          closeButton: false,
                          autoClose: 2000,
                          style: {
                            backgroundColor: "#ffffff",
                            color: "#ff3333",
                            border: "1px solid #cccccc",
                            fontSize: "14px",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            pointerEvents: "none",
                          }
                        });
                        return;
                      }
                      
                      // Add to cart with selected quantity
                      axios.post(`https://it342-g5-cartella.onrender.com/api/cart/${userId}/add/${selectedProduct.productId}?quantity=${quantity}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      })
                      .then(response => {
                        toast.success("Product added to cart successfully!", {
                          position: "bottom-right",
                          closeButton: false,
                          autoClose: 2000,
                          style: {
                            backgroundColor: "#ffffff",
                            color: "#333333",
                            border: "1px solid #cccccc",
                            fontSize: "14px",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            pointerEvents: "none",
                          }
                        });
                        handleCloseDialog();
                      })
                      .catch(error => {
                        console.error("Error adding to cart:", error);
                        if (error.response && error.response.status === 404) {
                          // Cart doesn't exist, create one first
                          axios.post(`https://it342-g5-cartella.onrender.com/api/cart/${userId}`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                          })
                          .then(() => {
                            // Now add the product to the newly created cart
                            return axios.post(`https://it342-g5-cartella.onrender.com/api/cart/${userId}/add/${selectedProduct.productId}?quantity=${quantity}`, {}, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                          })
                          .then(() => {
                            toast.success("Product added to cart successfully!", {
                              position: "bottom-right",
                              closeButton: false,
                              autoClose: 2000,
                              style: {
                                backgroundColor: "#ffffff",
                                color: "#333333",
                                border: "1px solid #cccccc",
                                fontSize: "14px",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                pointerEvents: "none",
                              }
                            });
                            handleCloseDialog();
                          })
                          .catch(err => {
                            console.error("Error creating cart or adding product:", err);
                            toast.error("Failed to add product to cart. Please try again.", {
                              position: "bottom-right",
                              closeButton: false,
                              autoClose: 2000,
                              style: {
                                backgroundColor: "#ffffff",
                                color: "#ff3333",
                                border: "1px solid #cccccc",
                                fontSize: "14px",
                                padding: "10px 15px",
                                borderRadius: "8px",
                                pointerEvents: "none",
                              }
                            });
                          });
                        } else if (error.response && error.response.data && error.response.data.message) {
                          // Display the specific error message from the server
                          toast.error(error.response.data.message, {
                            position: "bottom-right",
                            closeButton: false,
                            autoClose: 2000,
                            style: {
                              backgroundColor: "#ffffff",
                              color: "#ff3333",
                              border: "1px solid #cccccc",
                              fontSize: "14px",
                              padding: "10px 15px",
                              borderRadius: "8px",
                              pointerEvents: "none",
                            }
                          });
                        } else {
                          toast.error("Failed to add product to cart. Please try again.", {
                            position: "bottom-right",
                            closeButton: false,
                            autoClose: 2000,
                            style: {
                              backgroundColor: "#ffffff",
                              color: "#ff3333",
                              border: "1px solid #cccccc",
                              fontSize: "14px",
                              padding: "10px 15px",
                              borderRadius: "8px",
                              pointerEvents: "none",
                            }
                          });
                        }
                      });
                    }}
                    disabled={selectedProduct.stockQuantity <= 0}
                    sx={{
                      bgcolor: selectedProduct.stockQuantity <= 0 ? "grey.400" : "#D32F2F",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: selectedProduct.stockQuantity <= 0 ? "grey.400" : "#b71c1c",
                      },
                    }}
                  >
                    {selectedProduct.stockQuantity <= 0 ? "Sold Out" : "Add to Cart"}
                  </Button>
                  <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Box>
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
      <ToastContainer
        hideProgressBar={false}
        closeButton={false}
        newestOnTop={false}
        pauseOnHover={false}
        draggable={false}
        autoClose={2000}
        transition={Slide}
      />
    </Box>
  );
};

export default MenAccessories;
