import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import addressService from '../api/addressService';
import paymentService from '../api/paymentService';
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Grid, Card, CardMedia, 
  CardContent, CircularProgress, Alert, Button, Divider,
  Checkbox, FormControlLabel, FormGroup
} from "@mui/material";

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
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 240;

const stripePromise = loadStripe('pk_test_51RH2ZDCoSzNJio8VMI45wqQIhh4Rv7qBoUlOFWZJFOjDd5XU4LbJzPtDE98LsQ8luIwV9Polma5NFnnQHphv9pJ100uNNRnz3A');

const Cart = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const email = sessionStorage.getItem("email");
    const userId = sessionStorage.getItem("userId");
    
    if (!token || !email || !userId) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    // Fetch cart items
    fetchCartItems(userId, token);
  }, [navigate]);

  // Handle selected items and total price updates when cart items change
  useEffect(() => {
    // Reset selections when cart items change
    setSelectedItems([]);
    setSelectAll(false);
    calculateTotalPrice();
  }, [cartItems]);

  const fetchCartItems = async (userId, token) => {
    try {
      setLoading(true);
      // Use the new DTO endpoint to get cart items with product details
      const response = await axios.get(`http://localhost:8080/api/cart/items-dto/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setCartItems(response.data);
        calculateTotalPrice(response.data);
      } else {
        setCartItems([]);
        setTotalPrice(0);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (itemIds = selectedItems) => {
    const total = cartItems.reduce((sum, item) => {
      if (itemIds.includes(item.cartItemId)) {
        return sum + item.subtotal;
      }
      return sum;
    }, 0);
    setTotalPrice(total);
  };

  const handleSelectItem = (cartItemId) => {
    const isSelected = selectedItems.includes(cartItemId);
    let newSelectedItems;
    
    if (isSelected) {
      // Remove from selection
      newSelectedItems = selectedItems.filter(id => id !== cartItemId);
    } else {
      // Add to selection
      newSelectedItems = [...selectedItems, cartItemId];
    }
    
    setSelectedItems(newSelectedItems);
    
    // Update select all status
    setSelectAll(newSelectedItems.length === cartItems.length);
    
    // Recalculate total price based on selections
    calculateTotalPrice(newSelectedItems);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    let newSelectedItems = [];
    if (newSelectAll) {
      // Select all items
      newSelectedItems = cartItems.map(item => item.cartItemId);
    }
    
    setSelectedItems(newSelectedItems);
    
    // Recalculate total price based on selections
    calculateTotalPrice(newSelectedItems);
  };

  const handleRemoveItem = async (cartItemId) => {
    const token = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    
    try {
      await axios.delete(`http://localhost:8080/api/cart/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart after removal
      fetchCartItems(userId, token);
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    const token = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    
    if (newQuantity <= 0) {
      alert("Quantity must be greater than zero");
      return;
    }
    
    try {
      await axios.put(`http://localhost:8080/api/cart/update/${cartItemId}?quantity=${newQuantity}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart after update
      fetchCartItems(userId, token);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleCheckout = async () => {
    // Check if any items are selected
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");
      const userId = sessionStorage.getItem("userId");
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");

      console.log("Starting checkout process...");
      console.log("User ID:", userId);
      console.log("Email:", email);
      console.log("Username:", username);

      // Check for default address
      let addresses;
      if (email) {
        console.log("Fetching addresses by email...");
        addresses = await addressService.getAddressesByEmail(email);
      } else if (username) {
        console.log("Fetching addresses by username...");
        addresses = await addressService.getAddressesByUsername(username);
      }

      console.log("Fetched addresses:", addresses);
      console.log("Number of addresses:", addresses.length);

      // Log each address's isDefault property
      addresses.forEach((addr, index) => {
        console.log(`Address ${index + 1} isDefault:`, addr.isDefault);
        console.log(`Address ${index + 1} default:`, addr.default);
        console.log(`Address ${index + 1} full object:`, addr);
      });

      // If there's only one address, use it as default
      let defaultAddress;
      if (addresses.length === 1) {
        console.log("Only one address found, using it as default");
        defaultAddress = addresses[0];
      } else {
        // Check for both isDefault and default properties
        defaultAddress = addresses.find(address => 
          address.isDefault === true || address.default === true
        );
        console.log("Default address found:", defaultAddress);
      }

      if (!defaultAddress) {
        console.log("No default address found, redirecting to address page...");
        alert("Please set a default address before proceeding with checkout.");
        navigate('/address');
        return;
      }

      console.log("Default address ID:", defaultAddress.addressId);
      console.log("Default address details:", {
        streetAddress: defaultAddress.streetAddress,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
        isDefault: defaultAddress.isDefault,
        default: defaultAddress.default
      });

      // Store the default address ID in session storage for use in checkout
      sessionStorage.setItem('defaultAddressId', defaultAddress.addressId);
      console.log("Stored default address ID in session storage");

      // Create checkout session on the backend
      console.log("Creating payment intent with address ID:", defaultAddress.addressId);
      const response = await axios.post(
        'http://localhost:8080/api/payment/create-payment-intent',
        {
          amount: totalPrice * 100, // Convert to cents
          currency: 'php',
          userId: userId,
          addressId: defaultAddress.addressId // Include the default address ID
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { clientSecret: sessionId } = response.data;

      // Load Stripe
      const stripe = await stripePromise;
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const logoSrc =
    mode === "light"
      ? "src/images/Cartella Logo (Light).jpeg"
      : "src/images/Cartella Logo (Dark2).jpeg";

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
            <Typography variant="h2" sx={{ fontFamily: "GDS Didot, serif", fontSize: "26px", color: "inherit", marginRight: 3 }}>
              Cartella
            </Typography>
            <Box display="flex" alignItems="center" sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
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
                  "& input": { border: "none", outline: "none" },
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
          height: "calc(100vh - 64px)", // Subtract the AppBar height
          overflow: "hidden" // Prevent double scrollbars
        }}
      >
        <Box 
          sx={{ 
            width: "100%", 
            maxWidth: "1200px", 
            mx: "auto",
            overflowY: "auto", 
            pr: 2, // Add padding for the scrollbar
            height: "100%",
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
          }}
        >
          <Typography variant="h4" gutterBottom>My Cart</Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : cartItems.length === 0 ? (
            <Typography align="center" sx={{ mt: 10 }}>
              Your cart is empty. <Button color="primary" onClick={() => navigate("/dashboard")}>Continue Shopping</Button>
            </Typography>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      sx={{
                        color: mode === "light" ? "#D32F2F" : "#f44336",
                        '&.Mui-checked': {
                          color: mode === "light" ? "#D32F2F" : "#f44336",
                        },
                      }}
                    />
                  }
                  label="Select All"
                />
              </Box>
              
              <Grid container spacing={3}>
                {cartItems.map((item) => (
                  <Grid item xs={12} key={item.cartItemId}>
                    <Card sx={{ 
                      display: 'flex', 
                      p: 2,
                      borderRadius: 2,
                      bgcolor: mode === "light" ? "#FFFFFF" : "#2A2A2A",
                      boxShadow: mode === "light" 
                        ? "0 2px 8px rgba(0,0,0,0.1)" 
                        : "0 2px 8px rgba(0,0,0,0.3)"
                    }}>
                      <Checkbox 
                        checked={selectedItems.includes(item.cartItemId)}
                        onChange={() => handleSelectItem(item.cartItemId)}
                        sx={{
                          color: mode === "light" ? "#D32F2F" : "#f44336",
                          '&.Mui-checked': {
                            color: mode === "light" ? "#D32F2F" : "#f44336",
                          },
                          mr: 1
                        }}
                      />
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 120, objectFit: 'contain', mr: 2 }}
                        image={item.productImageUrl ? `http://localhost:8080${item.productImageUrl}` : 'https://via.placeholder.com/120'}
                        alt={item.productName}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <CardContent sx={{ flex: '1 0 auto', p: 1 }}>
                          <Typography variant="h6" component="div">
                            {item.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.productDescription}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                              Quantity: 
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </IconButton>
                            <Typography variant="body2" sx={{ mx: 1 }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                            >
                              +
                            </IconButton>
                          </Box>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ₱ {item.subtotal.toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          sx={{ 
                            bgcolor: mode === "light" ? "rgba(211, 47, 47, 0.1)" : "rgba(211, 47, 47, 0.2)",
                            "&:hover": {
                              bgcolor: mode === "light" ? "rgba(211, 47, 47, 0.2)" : "rgba(211, 47, 47, 0.3)"
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2,
                position: 'sticky',
                bottom: 0,
                bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
                borderTop: `1px solid ${mode === "light" ? "#e0e0e0" : "#333"}`,
                zIndex: 1
              }}>
                <Typography variant="h5">
                  Total: ₱ {totalPrice.toLocaleString()}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={handleCheckout}
                  sx={{ 
                    bgcolor: "#D32F2F",
                    "&:hover": { bgcolor: "#b71c1c" }
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Cart;
