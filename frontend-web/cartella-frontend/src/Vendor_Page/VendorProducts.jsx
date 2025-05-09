import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Button, Grid, Card, CardMedia, CardContent,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, Modal
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
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 240;

const VendorProducts = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const vendorId = sessionStorage.getItem("vendorId");
    const authToken = sessionStorage.getItem("authToken");
    
    if (!vendorId || !authToken) {
      setIsModalOpen(true);
      setLoading(false);
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
        setCategories(["All", ...data]);
      })
      .catch(err => setError("Failed to load categories: " + err.message));

    // Fetch products
    fetch(`https://it342-g5-cartella.onrender.com/api/products/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
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
        setError("Failed to load products: " + err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate("/vendor-login");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("vendorId");
    sessionStorage.removeItem("businessName");
    sessionStorage.removeItem("joinedDate");
    navigate("/vendor-login");
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

  const handleAddProduct = () => {
    navigate("/vendor-add-product");
  };

  const handleEditProduct = (product) => {
    navigate("/vendor-edit-product", { state: { productId: product.productId } });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const vendorId = sessionStorage.getItem("vendorId");
    const authToken = sessionStorage.getItem("authToken");
    
    if (!vendorId || !authToken || !productToDelete) {
      setError("Not authenticated or missing product ID");
      setDeleteDialogOpen(false);
      return;
    }

    fetch(`https://it342-g5-cartella.onrender.com/api/products/${productToDelete.productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete product");
        setProducts(products.filter(p => p.productId !== productToDelete.productId));
        setFilteredProducts(filteredProducts.filter(p => p.productId !== productToDelete.productId));
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      })
      .catch(err => {
        setError("Failed to delete product: " + err.message);
        setDeleteDialogOpen(false);
      });
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">My Products</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
                startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "#D32F2E",
                color: "#FFFFFF",
                textTransform: "none",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
              }}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : filteredProducts.length === 0 ? (
          <Typography align="center" sx={{ mt: 10 }}>
            {selectedCategory === "All" 
              ? "You have no products posted yet." 
              : `You have no products in the ${selectedCategory} category.`}
          </Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
                <Card
                  sx={{
                    bgcolor: mode === "light" ? "#f5f5f5" : "#2c2c2c",
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
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: mode === "light" 
                        ? "0 8px 16px rgba(0,0,0,0.1)" 
                        : "0 8px 16px rgba(0,0,0,0.3)",
                    },
                  }}
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
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                        zIndex: 1,
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        sx={{ 
                          color: mode === "light" ? "#1976d2" : "#90caf9",
                          bgcolor: mode === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(26, 26, 26, 0.9)",
                          "&:hover": {
                            bgcolor: mode === "light" ? "rgba(25, 118, 210, 0.1)" : "rgba(144, 202, 249, 0.1)",
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(product);
                        }}
                        sx={{ 
                          color: mode === "light" ? "#d32f2f" : "#ef5350",
                          bgcolor: mode === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(26, 26, 26, 0.9)",
                          "&:hover": {
                            bgcolor: mode === "light" ? "rgba(211, 47, 47, 0.1)" : "rgba(239, 83, 80, 0.1)",
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
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
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "inline-block",
                        bgcolor: mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {product.category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default VendorProducts;