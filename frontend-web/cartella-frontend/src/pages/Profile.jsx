import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, TextField, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  CircularProgress, Alert, InputAdornment
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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import axios from "axios";
import userService from "../api/userService";

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
  
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
  
    const fetchUserData = async () => {
      try {
        setLoading(true);
  
        const email = sessionStorage.getItem("email"); // Fetch email from sessionStorage
        let userData;
  
        if (email) {
          // Google login: Fetch user data by email
          console.log("Fetching user data for email:", email);
          setIsGoogleUser(true);
          const response = await axios.get(`http://localhost:8080/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Dashboard response:", response.data);
          userData = response.data;
        } else {
          // Normal login: Fetch user data by username
          const username = sessionStorage.getItem("username");
          console.log("Fetching user data for username:", username);
          setIsGoogleUser(false);
          userData = await userService.getUserByUsername(username);
        }
  
        // Map backend data to form fields
        setFormData({
          username: userData.username || "",
          password: "", // Don't display password
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          address: "", // Not in User entity, might be in another entity
          dob: userData.dateOfBirth || "",
          gender: userData.gender ? userData.gender.toLowerCase() : "",
        });
  
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

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const username = sessionStorage.getItem("username");
      const email = sessionStorage.getItem("email");
      
      if (!token) {
        alert("You must be logged in to update your profile.");
        navigate("/login");
        return;
      }
      
      // Map form data to backend format
      const userData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        dateOfBirth: formData.dob,
        gender: formData.gender ? formData.gender.toUpperCase() : null
      };
      
      // Only include password if it's been changed and user is not a Google user
      if (formData.password && !isGoogleUser) {
        userData.password = formData.password;
      }
      
      console.log("Updating user profile with data:", userData);
      
      let response;
      
      if (email) {
        // Google OAuth user - use the userService
        console.log("Updating Google OAuth user with email:", email);
        response = await userService.updateUserByEmail(email, userData);
      } else if (username) {
        // Regular user - use the username endpoint
        console.log("Updating regular user with username:", username);
        response = await userService.updateUserByUsername(username, userData);
      } else {
        throw new Error("No username or email found in session storage");
      }
      
      console.log("Profile update response:", response);
      alert("Profile updated successfully!");
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Error details:", err.response?.data);
      alert(`Failed to update profile: ${err.response?.data?.error || err.message}`);
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
        <Box sx={{ alignSelf: "flex-start" }}>
          <Typography variant="h4" sx={{ mb: 0 }}>My Profile</Typography>
          <Typography variant="body2" sx={{ mb: 4, mt: 0.5, color: mode === "light" ? "#000" : "#FFF" }}>
            Manage and protect your account
          </Typography>
        </Box>

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
              gap: 1,
              bgcolor: mode === "dark" ? "#2A2A2A" : "#f9f9f9",
              p: 4,
              borderRadius: 2,
              boxShadow: 2,
              position: "relative",
              color: mode === "dark" ? "#fff" : "#000",
            }}
          >
            <TextField label="Username" name="username" value={formData.username} onChange={handleChange} fullWidth />
            
            {isGoogleUser ? (
              <TextField 
                label="Password" 
                name="password" 
                type="password" 
                value="********" 
                disabled 
                fullWidth 
                helperText="Password cannot be changed for Google accounts"
              />
            ) : (
              <TextField 
                label="Password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Leave blank to keep current password" 
                onChange={handleChange} 
                fullWidth 
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
            
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
            <TextField label="Phone number" name="phone" value={formData.phone} onChange={handleChange} fullWidth />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Address</Typography>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<LocationOnIcon />}
                onClick={() => navigate('/address')}
              >
                Manage Addresses
              </Button>
            </Box>
            
            <Box>
              <Typography sx={{ color: mode === "dark" ? "#ccc" : "#000", mb: 1 }}>
                Date of Birth
              </Typography>
              <TextField
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ style: { color: mode === "dark" ? "#fff" : "#000" } }}
                fullWidth
              />
            </Box>

            <FormControl>
              <FormLabel sx={{ color: mode === "dark" ? "#ccc" : undefined }}>Gender</FormLabel>
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
              sx={{ alignSelf: "flex-end", mt: 2 }}
            >
              Save Profile
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
