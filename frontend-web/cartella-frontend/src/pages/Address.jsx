import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, Button, TextField, FormControlLabel,
  Checkbox, CircularProgress, Alert, Card, CardContent, CardActions,
  Grid, Divider, Dialog, DialogActions, DialogContent, DialogTitle, Paper,
  InputBase
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";

import addressService from "../api/addressService";
import userService from "../api/userService";

const drawerWidth = 240;

const Address = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    fetchAddresses();
  }, [navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      
      let response;
      
      if (email) {
        // Google OAuth user
        response = await addressService.getAddressesByEmail(email);
      } else if (username) {
        // Regular user
        response = await addressService.getAddressesByUsername(username);
      } else {
        throw new Error("No username or email found in session storage");
      }
      
      setAddresses(response);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(`Failed to load addresses: ${err.message}`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "isDefault" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      
      let response;
      
      if (editingAddress) {
        // Update existing address
        response = await addressService.updateAddress(editingAddress.addressId, formData);
        setAddresses(addresses.map(addr => 
          addr.addressId === editingAddress.addressId ? response : addr
        ));
      } else {
        // Create new address
        if (email) {
          response = await addressService.createAddressByEmail(email, formData);
        } else if (username) {
          // For regular users, we need to get the user ID first
          const userData = await userService.getUserByUsername(username);
          response = await addressService.createAddress(userData.userId, formData);
        }
        
        setAddresses([...addresses, response]);
      }
      
      handleCloseDialog();
      alert(editingAddress ? "Address updated successfully!" : "Address added successfully!");
    } catch (err) {
      console.error("Error saving address:", err);
      alert(`Failed to save address: ${err.message}`);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await addressService.deleteAddress(addressId);
        setAddresses(addresses.filter(addr => addr.addressId !== addressId));
        alert("Address deleted successfully!");
      } catch (err) {
        console.error("Error deleting address:", err);
        alert(`Failed to delete address: ${err.message}`);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      setAddresses(addresses.map(addr => 
        addr.addressId === addressId ? response : 
        addr.isDefault ? { ...addr, isDefault: false } : addr
      ));
      alert("Default address updated successfully!");
    } catch (err) {
      console.error("Error setting default address:", err);
      alert(`Failed to set default address: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false
    });
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault
      });
    } else {
      setEditingAddress(null);
      setFormData({
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setFormData({
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
  };

  const logoSrc = mode === "light"
    ? "src/images/Cartella Logo (Light).jpeg"
    : "src/images/Cartella Logo (Dark2).jpeg";

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {[{ text: "Categories", path: "/dashboard", icon: <DashboardIcon /> },
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
      <AppBar position="fixed" elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: mode === "dark" ? "#3A3A3A" : "#D32F2F",
          color: "#fff"
        }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={logoSrc} alt="Logo" style={{ height: 40, marginRight: 10 }} />
            <Typography variant="h2" sx={{ fontFamily: "GDS Didot, serif", fontSize: "26px", marginRight: 3 }}>
              Cartella
            </Typography>
            <Box display="flex" alignItems="center"
              sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
              <IconButton onClick={handleSearch}><SearchIcon sx={{ color: "#1A1A1A" }} /></IconButton>
              <InputBase
                placeholder="Search items"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ flex: 1, color: "#000" }}
              />
            </Box>
          </Box>
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent"
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

      <Box component="main"
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          p: 3,
          mt: 8,
          color: mode === "light" ? "#000" : "#FFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
          <Typography variant="h4" sx={{ mb: 0 }}>My Addresses</Typography>
          <Typography variant="body2" sx={{ mb: 4, mt: 0.5, color: mode === "light" ? "#000" : "#FFF" }}>
            Manage your shipping addresses
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%', maxWidth: '1000px' }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ width: '100%', maxWidth: '1000px', mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="error"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add New Address
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Box sx={{ 
                width: "100%", 
                maxWidth: "1000px", 
                textAlign: "center", 
                py: 4,
                bgcolor: mode === "dark" ? "#2A2A2A" : "#f9f9f9",
                borderRadius: 2,
                boxShadow: 2,
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  You don't have any addresses yet
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Add an address to make checkout easier
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add New Address
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ width: '100%', maxWidth: '1000px' }}>
                {addresses.map((address) => (
                  <Grid item xs={12} sm={6} key={address.addressId}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: mode === "dark" ? "#2A2A2A" : "#f9f9f9",
                        color: mode === "dark" ? "#fff" : "#000",
                        position: 'relative'
                      }}
                    >
                      {address.isDefault && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 10, 
                            bgcolor: mode === "dark" ? "#D32F2F" : "#D32F2F",
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Default
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <HomeIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            {address.isDefault ? "Default Address" : "Address"}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {address.streetAddress}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {address.city}, {address.state} {address.postalCode}
                        </Typography>
                        <Typography variant="body1">
                          {address.country}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        {!address.isDefault && (
                          <Button 
                            size="small" 
                            onClick={() => handleSetDefault(address.addressId)}
                            sx={{ color: mode === "dark" ? "#fff" : "#000" }}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />} 
                          onClick={() => handleEdit(address)}
                          sx={{ color: mode === "dark" ? "#fff" : "#000" }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<DeleteIcon />} 
                          onClick={() => handleDelete(address.addressId)}
                          sx={{ color: "#D32F2F" }}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.isDefault} 
                  onChange={handleInputChange} 
                  name="isDefault" 
                  color="error" 
                />
              }
              label="Set as default address"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="error">
            {editingAddress ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Address; 