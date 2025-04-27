import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Paper
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ColorModeContext } from "../ThemeContext";
import productService from "../api/productService";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const drawerWidth = 240;

const EditProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    image: null
  });

  useEffect(() => {
    // Check if a productId was provided (edit mode) and fetch data
    if (location.state?.productId) {
      setLoading(true);
      
      // Fetch the product data using productService
      productService.getProductById(location.state.productId)
        .then(data => {
          setProduct(data);
          
          // Set form data
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            stockQuantity: data.stockQuantity.toString(),
            category: data.category
          });
          
          // Set image preview if available
          if (data.imageUrl) {
            setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${data.imageUrl}`);
          }
          
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load product: " + err.message);
          setLoading(false);
        });
    }
  }, [location.state]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    const productId = location.state?.productId;
    
    if (!productId) {
      setError("Missing product ID");
      setSubmitting(false);
      return;
    }

    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.stockQuantity || !formData.category) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    // Create FormData object for multipart/form-data
    const productFormData = new FormData();
    productFormData.append("name", formData.name);
    productFormData.append("description", formData.description);
    productFormData.append("price", formData.price);
    productFormData.append("stockQuantity", formData.stockQuantity);
    productFormData.append("category", formData.category);
    
    // Only append image if a new one is selected
    if (formData.image) {
      productFormData.append("image", formData.image);
    }

    productService.updateProduct(productId, productFormData)
      .then(data => {
        setSuccess(true);
        setTimeout(() => {
          navigate("/vendor-products");
        }, 2000);
      })
      .catch(err => {
        setError("Failed to update product: " + err.message);
        setSubmitting(false);
      });
  };

  const handleBack = () => {
    navigate("/vendor-products");
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
          color: mode === "light" ? "#000" : "#FFF",
          p: 3,
          mt: 8,
          overflow: "auto",
          height: "92vh",
        }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Edit Product</Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Product updated successfully! Redirecting to products page...
          </Alert>
        ) : (
          <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Price (₱)"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Stock Quantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: mode === 'light' ? '#ccc' : '#555',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: mode === 'light' ? '#999' : '#777',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      onChange={handleChange}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                          {imagePreview ? 'Change Image' : 'Upload Product Image'}
                        </Typography>
                        {imagePreview && (
                          <Box
                            component="img"
                            src={imagePreview}
                            alt="Preview"
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 200,
                              mt: 2,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </Box>
                    </label>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{
                        backgroundColor: "#D32F2E",
                        color: "#FFFFFF",
                        "&:hover": {
                          backgroundColor: "#b71c1c",
                        },
                      }}
                    >
                      {submitting ? <CircularProgress size={24} /> : "Update Product"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default EditProduct;
