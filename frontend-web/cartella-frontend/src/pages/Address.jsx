import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, Button, TextField, FormControlLabel,
  Checkbox, CircularProgress, Alert, Card, CardContent, CardActions,
  Grid, Divider, Dialog, DialogActions, DialogContent, DialogTitle, Paper,
  InputBase, Modal
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [formData, setFormData] = useState({
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    fetchAddresses();
  }, [navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      
      const response = email 
        ? await addressService.getAddressesByEmail(email)
        : await addressService.getAddressesByUsername(username);

      // Sort with default first
      setAddresses(response.sort((a, b) => b.isDefault - a.isDefault));
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
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
      setIsSubmitting(true);
      let response;
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");

      if (editingAddress) {
        response = await addressService.updateAddress(editingAddress.addressId, formData);
        setAddresses(prev => prev.map(addr => 
          addr.addressId === editingAddress.addressId ? response : addr
        ));
      } else {
        if (email) {
          response = await addressService.createAddressByEmail(email, formData);
        } else {
          const user = await userService.getUserByUsername(username);
          response = await addressService.createAddress(user.userId, formData);
        }
        setAddresses(prev => [response, ...prev]);
      }

      handleCloseDialog();
      toast.success(editingAddress ? "Address updated!" : "Address added!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
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
    setOpenDialog(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      await addressService.deleteAddress(addressToDelete);
      setAddresses(addresses.filter(addr => addr.addressId !== addressToDelete));
      toast.success("Address deleted successfully!");
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error(`Failed to delete address: ${err.message}`);
    }
  };

  const handleDelete = (addressId) => {
    setAddressToDelete(addressId);
    setIsDeleteModalOpen(true);
  };

  const handleSetDefault = async (addressId) => {
    try {
      setIsSettingDefault(addressId);
      
      // Update backend first
      await addressService.setDefaultAddress(addressId);
      
      // Optimistic update
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.addressId === addressId ? true : false
      })));
      
      toast.success("Default address updated!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message);
      // Revert by refetching
      await fetchAddresses();
    } finally {
      setIsSettingDefault(null);
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
    setOpenDialog(false);
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
        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Box>
  );
  // Add a useEffect to show toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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
                sx={{ flex: 1, color: "#000", "& input": { border: "none", outline: "none" } }}
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
                        position: 'relative',
                        border: address.isDefault ? '2px solid #D32F2F' : 'none',
                        boxShadow: address.isDefault ? '0 0 10px rgba(211, 47, 47, 0.3)' : 'none'
                      }}
                    >
                      {address.isDefault && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            bgcolor: '#d32f2f',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <HomeIcon fontSize="small" />
                          <span>Default</span>
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
                            disabled={isSettingDefault === address.addressId}
                            sx={{ color: mode === "dark" ? "#fff" : "#000" }}
                          >
                            {isSettingDefault === address.addressId ? (
                              <CircularProgress size={20} />
                            ) : (
                              "Set as Default"
                            )}
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
      </Box>      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            backgroundColor: mode === "dark" ? "#2A2A2A" : "#fff",
            color: mode === "dark" ? "#fff" : "#000",
          }
        }}
        TransitionProps={{
          sx: {
            transition: 'all 0.3s ease-in-out !important'
          }
        }}
      >
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: mode === "dark" ? "#3a3a3a" : "#f5f5f5", 
          borderBottom: `1px solid ${mode === "dark" ? "#444" : "#e0e0e0"}`,
          display: 'flex',
          alignItems: 'center'
        }}>
          <HomeIcon sx={{ color: "#D32F2F", mr: 1.5, fontSize: 28 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Typography>
        </Box>
        
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 3, color: mode === "dark" ? "#aaa" : "#666" }}>
            Enter your address details below. Fields marked with * are required.
          </Typography>
          
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Street Address *"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: 1.5,
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "rgba(211, 47, 47, 0.2)"}`
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City *"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { 
                      borderRadius: 1.5,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "rgba(211, 47, 47, 0.2)"}`
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province *"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { 
                      borderRadius: 1.5,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "rgba(211, 47, 47, 0.2)"}`
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code *"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  helperText="5-10 digit postal code"
                  inputProps={{
                    pattern: "[0-9]{5,10}",
                    title: "5-10 digit postal code"
                  }}
                  InputProps={{
                    sx: { 
                      borderRadius: 1.5,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "rgba(211, 47, 47, 0.2)"}`
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country *"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  helperText="Country name (2-56 characters)"
                  inputProps={{
                    pattern: "[A-Za-z ]{2,56}",
                    title: "Valid country name (2-56 characters)"
                  }}
                  InputProps={{
                    sx: { 
                      borderRadius: 1.5,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "rgba(211, 47, 47, 0.2)"}`
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Paper 
              sx={{ 
                p: 2, 
                mt: 3, 
                bgcolor: mode === "dark" ? "rgba(211, 47, 47, 0.08)" : "rgba(211, 47, 47, 0.05)",
                borderRadius: 2,
                border: `1px solid ${mode === "dark" ? "rgba(211, 47, 47, 0.2)" : "rgba(211, 47, 47, 0.15)"}`,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.isDefault} 
                    onChange={handleInputChange} 
                    name="isDefault" 
                    color="error"
                    sx={{
                      '&.Mui-checked': {
                        color: '#D32F2F',
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Set as default address</Typography>
                    <Typography variant="body2" sx={{ color: mode === "dark" ? "#aaa" : "#666", fontSize: '0.8rem' }}>
                      This address will be used as the default for all shipping orders
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Box>
        </DialogContent>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 3,
          pt: 2,
          borderTop: `1px solid ${mode === "dark" ? "#444" : "#e0e0e0"}`,
          gap: 1
        }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={isSubmitting}
            variant="outlined"
            sx={{ 
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              borderColor: mode === "dark" ? "#666" : "#ccc",
              color: mode === "dark" ? "#ddd" : "#555",
              '&:hover': {
                borderColor: mode === "dark" ? "#888" : "#aaa",
                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="error"
            disabled={isSubmitting}
            sx={{ 
              px: 3,
              borderRadius: 2,
              boxShadow: 2,
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
                backgroundColor: '#B71C1C'
              }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </Box>
      </Dialog>

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
            </Button>          </Box>
        </Box>
      </Modal>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-address-modal"
        aria-describedby="delete-address-confirmation"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: mode === "dark" ? "#2A2A2A" : "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            color: mode === "dark" ? "#fff" : "#000",
          }}
        >
          <DeleteIcon sx={{ color: "#D32F2F", fontSize: 40, mb: 2 }} />
          <Typography id="delete-address-modal" variant="h6" component="h2" sx={{ mb: 2 }}>
            Delete Address
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to delete this address? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#D32F2F",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#B71C1C",
                },
              }}
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: mode === "dark" ? "#ddd" : "#333333",
                border: `1px solid ${mode === "dark" ? "#666" : "#ccc"}`,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                },
              }}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Address;