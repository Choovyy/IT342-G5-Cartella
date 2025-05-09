import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, TextField, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  CircularProgress, Alert, InputAdornment, Card, CardContent, Modal
} from "@mui/material";
import { toast, ToastContainer, Slide } from "react-toastify";
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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HomeIcon from "@mui/icons-material/Home";

import axios from "axios";
import userService from "../api/userService";
import addressService from "../api/addressService";

const drawerWidth = 240;

const Profile = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const fetchDefaultAddress = async (email, username) => {
    try {
      let addresses = [];
      if (email) {
        console.log("Fetching addresses for email:", email);
        addresses = await addressService.getAddressesByEmail(email);
      } else if (username) {
        console.log("Fetching addresses for username:", username);
        addresses = await addressService.getAddressesByUsername(username);
      }
      
      console.log("All addresses:", JSON.stringify(addresses, null, 2));
      
      // Find the default address - check both isDefault and default properties
      const defaultAddr = addresses.find(addr => {
        console.log("Checking address:", addr.addressId, {
          isDefault: addr.isDefault,
          default: addr.default
        });
        return addr.isDefault === true || addr.default === true;
      });
      
      console.log("Default address found:", defaultAddr);
      
      if (defaultAddr) {
        console.log("Setting default address:", {
          id: defaultAddr.addressId,
          street: defaultAddr.streetAddress,
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country,
          isDefault: defaultAddr.isDefault,
          default: defaultAddr.default
        });
        setDefaultAddress(defaultAddr);
      } else {
        console.log("No default address found in addresses");
        setDefaultAddress(null);
      }
    } catch (err) {
      console.error("Error fetching default address:", err);
      console.error("Error details:", err.response?.data);
      setDefaultAddress(null);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        const email = sessionStorage.getItem("email");
        let userData;

        if (email) {
          console.log("Fetching user data for email:", email);
          setIsGoogleUser(true);
          const response = await axios.get(`https://it342-g5-cartella.onrender.com/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Dashboard response:", response.data);
          userData = response.data;
        } else {
          const username = sessionStorage.getItem("username");
          console.log("Fetching user data for username:", username);
          setIsGoogleUser(false);
          userData = await userService.getUserByUsername(username);
        }

        setFormData({
          username: userData.username || "",
          password: "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          address: "",
          dob: userData.dateOfBirth || "",
          gender: userData.gender ? userData.gender.toLowerCase() : "",
        });

        // Fetch default address after setting user data
        await fetchDefaultAddress(email, userData.username);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        console.error("Error details:", err.response?.data);
        setError(`Failed to load user data: ${err.response?.data || err.message}`);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = sessionStorage.getItem("authToken");
      const username = sessionStorage.getItem("username");
      const email = sessionStorage.getItem("email");

      if (!token) {
        toast.error("You must be logged in to update your profile.", {
          position: "bottom-right",
          closeButton: false,
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
        navigate("/login");
        return;
      }

      // Map form data to backend format
      const userData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        dateOfBirth: formData.dob,
        gender: formData.gender ? formData.gender.toUpperCase() : null,
      };

      // Only include password if it's been changed and user is not a Google user
      if (formData.password && !isGoogleUser) {
        userData.password = formData.password;
      }

      console.log("Updating user profile with data:", userData);

      let response;

      if (email) {
        console.log("Updating Google OAuth user with email:", email);
        response = await userService.updateUserByEmail(email, userData);
      } else if (username) {
        console.log("Updating regular user with username:", username);
        response = await userService.updateUserByUsername(username, userData);
      } else {
        throw new Error("No username or email found in session storage");
      }

      console.log("Profile update response:", response);
      toast.success("Profile updated successfully!", {
        position: "bottom-right",
        closeButton: false,
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

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(`Failed to update profile: ${err.response?.data?.error || err.message}`, {
        position: "bottom-right",
        closeButton: false,
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
            <Box display="flex" alignItems="center" sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
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

      <Box
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          color: mode === "light" ? "#000" : "#FFF",
          mt: 8,
          p: 3,
          overflow: "auto",
          height: "92vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 0 }}>My Profile</Typography>
        <Typography variant="body2" sx={{ mb: 4, mt: 0.5, color: mode === "light" ? "#000" : "#FFF", textAlign: "left" }}>
          Manage and protect your account
        </Typography>
        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%', maxWidth: '1000px' }}>{error}</Alert>
        ) : (
          <Box
            component="form"
            noValidate
            autoComplete="off"
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
                Username
              </Typography>
              <TextField 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
              
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000", mt: -3 }}>
                Password
              </Typography>
              {isGoogleUser ? (
                <TextField 
                  name="password" 
                  type="password" 
                  value="********" 
                  disabled 
                  fullWidth
                  variant="outlined"
                  helperText="Password cannot be changed for Google accounts"
                />
              ) : (
                <TextField 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Leave blank to keep current password" 
                  onChange={handleChange} 
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
              
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000", mt: -3 }}>
                Email
              </Typography>
              <TextField 
                name="email" 
                value={formData.email} 
                disabled 
                fullWidth
                variant="outlined"
                helperText="Email cannot be changed"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Phone Number
              </Typography>
              <TextField 
                name="phone" 
                value={formData.phone} 
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  setFormData(prev => ({ ...prev, phone: value }));
                }}
                fullWidth
                variant="outlined"
                inputProps={{
                  maxLength: 11,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ minWidth: '150px', color: mode === "dark" ? "#ccc" : "#000" }}>
                Date of Birth
              </Typography>
              <TextField
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ 
                  '& input::-webkit-calendar-picker-indicator': {
                    filter: mode === "dark" ? 'invert(1)' : 'none'
                  },
                  '& .MuiInputBase-root': {
                    color: mode === "dark" ? "#fff" : "#000",
                    height: '56px !important' 
                  }
                }}
              />
            </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Address</Typography>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<LocationOnIcon />}
                  onClick={() => navigate('/address')}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Addresses
                </Button>
              </Box>

              {defaultAddress ? (
                <Card 
                  sx={{ 
                    mb: 2,
                    bgcolor: mode === "dark" ? "#2A2A2A" : "#f9f9f9",
                    border: '2px solid #D32F2F',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#D32F2F',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <HomeIcon sx={{ fontSize: '1rem' }} />
                    Default Address
                  </Box>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {defaultAddress.streetAddress}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                    </Typography>
                    <Typography variant="body1">
                      {defaultAddress.country}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2, 
                    color: mode === "dark" ? "#ccc" : "#666",
                    fontStyle: 'italic'
                  }}
                >
                  No default address set. Click "Manage Addresses" to add one.
                </Typography>
              )}
              
              <FormControl>
                <FormLabel sx={{ color: mode === "dark" ? "#fff" : "#000" }}>Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleSubmit}
                sx={{ 
                  alignSelf: "flex-end", 
                  mt: 2,
                  textTransform: "none",
                  fontWeight: "100",
                  fontSize: "1rem"
                }}
              >
                Save Profile
              </Button>
          </Box>
        )}
        </Box>
      </Box>

      <ToastContainer
        hideProgressBar={false}
        closeButton={false}
        newestOnTop={false}
        pauseOnHover={false}
        draggable={false}
        autoClose={2000}
        transition={Slide}
      />

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

export default Profile;
