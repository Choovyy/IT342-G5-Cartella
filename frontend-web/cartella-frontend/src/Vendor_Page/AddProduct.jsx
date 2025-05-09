import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Paper, Modal,
  InputBase
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../ThemeContext";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";

const drawerWidth = 240;

const AddProduct = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    image: null
  });

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    
    if (!authToken) {
      setIsModalOpen(true);
      return;
    }

    // Fetch categories
    fetch("https://it342-g5-cartella.onrender.com/api/products/categories", {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load categories: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate("/vendor-login");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("businessName");
    sessionStorage.removeItem("joinedDate");
    navigate("/vendor-login");
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
    
    const vendorId = sessionStorage.getItem("vendorId");
    const authToken = sessionStorage.getItem("authToken");
    
    if (!vendorId || !authToken) {
      setError("Not authenticated. Please log in again.");
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
    if (formData.image) {
      productFormData.append("image", formData.image);
    }

    fetch(`https://it342-g5-cartella.onrender.com/api/products/${vendorId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: productFormData
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to add product");
        return res.json();
      })
      .then(data => {
        setSuccess(true);
        setTimeout(() => {
          navigate("/vendor-products");
        }, 2000);
      })
      .catch(err => {
        setError("Failed to add product: " + err.message);
        setSubmitting(false);
      });
  };

  const handleBack = () => {
    navigate("/vendor-products");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
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
        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
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
        <Typography variant="h4" sx={{ mb: 6 }}>Add New Product</Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Product added successfully! Redirecting to products page...
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              maxWidth: "1000px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: mode === "dark" ? "#2A2A2A" : "#f9f9f9",
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
              position: "relative",
              color: mode === "dark" ? "#fff" : "#000",
              mb: 4,
              margin: "0 auto",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Product Name
              </Typography>
              <TextField
                required
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Description
              </Typography>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Price (₱)
              </Typography>
              <TextField
                required
                fullWidth
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Stock Quantity
              </Typography>
              <TextField
                required
                fullWidth
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Category
              </Typography>
              <FormControl fullWidth required>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Product Image
              </Typography>
              <Box
                sx={{
                  flex: 1,
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
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/vendor-products")}
                disabled={submitting}
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: "100",
                  fontSize: "1rem",
                  height: "36px",
                  minWidth: "100px"
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                size="small"
                sx={{
                  backgroundColor: "#D32F2E",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#b71c1c",
                  },
                  textTransform: "none",
                  fontWeight: "100",
                  fontSize: "1rem",
                  height: "36px",
                  minWidth: "100px"
                }}
              >
                {submitting ? <CircularProgress size={24} /> : "Add"}
              </Button>
            </Box>
          </Box>
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

export default AddProduct;
