import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, TextField, Button, 
  Grid, Paper, CircularProgress, Snackbar, Alert, Divider,
  InputAdornment, IconButton as MuiIconButton, FormControl,
  InputLabel, Select, MenuItem, FormHelperText
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import logoLight from "../images/Cartella Logo (Light).jpeg";
import logoDark from "../images/Cartella Logo (Dark2).jpeg";

const drawerWidth = 240;

const VendorProfile = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [userDetails, setUserDetails] = useState({
    username: "",
    userId: "",
    vendorId: "",
    businessName: "",
    joinedDate: "",
  });
  
  const [profileData, setProfileData] = useState({
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
    email: "",
    phoneNumber: "",
  });
  
  const [editedProfile, setEditedProfile] = useState({
    businessName: "",
    businessAddress: "",
    businessRegistrationNumber: "",
    email: "",
    phoneNumber: "",
  });

  const [personalInfo, setPersonalInfo] = useState({
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });

  const [editedPersonalInfo, setEditedPersonalInfo] = useState({
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });

  const [personalInfoErrors, setPersonalInfoErrors] = useState({
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if user is authenticated
    const authToken = sessionStorage.getItem("authToken");
    const vendorId = sessionStorage.getItem("vendorId");
    
    if (!authToken || !vendorId) {
      navigate("/vendor-login");
      return;
    }
    
    // Set user details from session storage
    setUserDetails({
      username: sessionStorage.getItem("username") || "",
      userId: sessionStorage.getItem("userId") || "",
      vendorId: vendorId,
      businessName: sessionStorage.getItem("businessName") || "",
      joinedDate: sessionStorage.getItem("joinedDate") || "",
    });
    
    // Fetch vendor profile data
    const fetchVendorProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/vendors/${vendorId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch vendor profile');
        }
        
        // Get the response text first
        const responseText = await response.text();
        let data;
        
        try {
          // Try to parse the response text as JSON
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Raw response:', responseText);
          throw new Error('Invalid response format from server');
        }
        
        console.log('Vendor data received:', data);
        
        // Set profile data
        setProfileData({
          businessName: data.businessName || "",
          businessAddress: data.businessAddress || "",
          businessRegistrationNumber: data.businessRegistrationNumber || "",
          email: data.user?.email || "",
          phoneNumber: data.user?.phoneNumber || "",
        });
        
        // Initialize edited profile with the same data
        setEditedProfile({
          businessName: data.businessName || "",
          businessAddress: data.businessAddress || "",
          businessRegistrationNumber: data.businessRegistrationNumber || "",
          email: data.user?.email || "",
          phoneNumber: data.user?.phoneNumber || "",
        });

        // Set personal info
        setPersonalInfo({
          email: data.user?.email || "",
          phoneNumber: data.user?.phoneNumber || "",
          dateOfBirth: data.user?.dateOfBirth || "",
          gender: data.user?.gender || "",
        });

        // Initialize edited personal info with the same data
        setEditedPersonalInfo({
          email: data.user?.email || "",
          phoneNumber: data.user?.phoneNumber || "",
          dateOfBirth: data.user?.dateOfBirth || "",
          gender: data.user?.gender || "",
        });
      } catch (error) {
        console.error('Error fetching vendor profile:', error);
        setSnackbar({
          open: true,
          message: "Failed to load profile data. Please try again later.",
          severity: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendorProfile();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("vendorId");
    sessionStorage.removeItem("businessName");
    sessionStorage.removeItem("joinedDate");
    console.log("User logged out");
    navigate("/vendor-login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const authToken = sessionStorage.getItem("authToken");
      const vendorId = sessionStorage.getItem("vendorId");
      
      const response = await fetch(`http://localhost:8080/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(editedProfile)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedData = await response.json();
      
      // Update profile data with the response
      setProfileData({
        businessName: updatedData.businessName || editedProfile.businessName,
        businessAddress: updatedData.businessAddress || editedProfile.businessAddress,
        businessRegistrationNumber: updatedData.businessRegistrationNumber || editedProfile.businessRegistrationNumber,
        email: updatedData.user?.email || editedProfile.email,
        phoneNumber: updatedData.user?.phoneNumber || editedProfile.phoneNumber,
      });
      
      // Update session storage if business name changed
      if (updatedData.businessName && updatedData.businessName !== sessionStorage.getItem("businessName")) {
        sessionStorage.setItem("businessName", updatedData.businessName);
        setUserDetails(prev => ({
          ...prev,
          businessName: updatedData.businessName
        }));
      }
      
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: "Failed to update profile. Please try again later.",
        severity: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const logoSrc = mode === "light" ? logoLight : logoDark;

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setIsChangingPassword(true);
      const authToken = sessionStorage.getItem("authToken");
      const username = sessionStorage.getItem("username");
      
      // First, verify the current password
      const verifyResponse = await fetch(`http://localhost:8080/api/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: username,
          password: passwordData.currentPassword
        })
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Current password is incorrect');
      }
      
      // If current password is correct, proceed with password change
      const response = await fetch(`http://localhost:8080/api/users/username/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setSnackbar({
        open: true,
        message: "Password changed successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Set specific error for current password
      if (error.message.includes('Current password is incorrect')) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: "Current password is incorrect"
        }));
      }
      
      setSnackbar({
        open: true,
        message: error.message || "Failed to change password. Please try again.",
        severity: "error"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setEditedPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (personalInfoErrors[name]) {
      setPersonalInfoErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validatePersonalInfo = () => {
    const errors = {};
    let isValid = true;
    
    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!editedPersonalInfo.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(editedPersonalInfo.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Phone number validation (11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!editedPersonalInfo.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(editedPersonalInfo.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 11 digits";
      isValid = false;
    }
    
    // Date of birth validation (optional)
    if (editedPersonalInfo.dateOfBirth && !isValidDate(editedPersonalInfo.dateOfBirth)) {
      errors.dateOfBirth = "Please enter a valid date";
      isValid = false;
    }
    
    setPersonalInfoErrors(errors);
    return isValid;
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const handleSavePersonalInfo = async () => {
    if (!validatePersonalInfo()) {
      return;
    }
    
    try {
      setIsSavingPersonalInfo(true);
      const authToken = sessionStorage.getItem("authToken");
      const username = sessionStorage.getItem("username");
      
      const response = await fetch(`http://localhost:8080/api/users/username/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          email: editedPersonalInfo.email,
          phoneNumber: editedPersonalInfo.phoneNumber,
          dateOfBirth: editedPersonalInfo.dateOfBirth,
          gender: editedPersonalInfo.gender
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update personal information');
      }
      
      // Update personal info with the edited data
      setPersonalInfo({
        ...editedPersonalInfo
      });
      
      setSnackbar({
        open: true,
        message: "Personal information updated successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error('Error updating personal information:', error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update personal information. Please try again.",
        severity: "error"
      });
    } finally {
      setIsSavingPersonalInfo(false);
    }
  };

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
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          p: 3,
          mt: 8,
          color: mode === "light" ? "#000" : "#FFF",
          height: "calc(100vh - 64px)", // Subtract AppBar height
          overflowY: "auto", // Enable vertical scrolling
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: mode === "light" ? "#f1f1f1" : "#2a2a2a",
          },
          "&::-webkit-scrollbar-thumb": {
            background: mode === "light" ? "#D32F2F" : "#f44336",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: mode === "light" ? "#B71C1C" : "#d32f2f",
          },
        }}
      >
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3 }}>
          Welcome, {userDetails.username || "Vendor"}
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                border: "1px solid",
                borderColor: mode === "light" ? "#ccc" : "#444",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={editedProfile.businessName}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Registration Number"
                    name="businessRegistrationNumber"
                    value={editedProfile.businessRegistrationNumber}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    name="businessAddress"
                    value={editedProfile.businessAddress}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      sx={{ 
                        backgroundColor: mode === "light" ? "#D32F2F" : "#f44336",
                        '&:hover': {
                          backgroundColor: mode === "light" ? "#B71C1C" : "#d32f2f",
                        }
                      }}
                    >
                      {isSaving ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                border: "1px solid",
                borderColor: mode === "light" ? "#ccc" : "#444",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editedPersonalInfo.email}
                    onChange={handlePersonalInfoChange}
                    margin="normal"
                    variant="outlined"
                    error={!!personalInfoErrors.email}
                    helperText={personalInfoErrors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={editedPersonalInfo.phoneNumber}
                    onChange={handlePersonalInfoChange}
                    margin="normal"
                    variant="outlined"
                    error={!!personalInfoErrors.phoneNumber}
                    helperText={personalInfoErrors.phoneNumber}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={editedPersonalInfo.dateOfBirth || ""}
                    onChange={handlePersonalInfoChange}
                    margin="normal"
                    variant="outlined"
                    error={!!personalInfoErrors.dateOfBirth}
                    helperText={personalInfoErrors.dateOfBirth}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={!!personalInfoErrors.gender}
                  >
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      name="gender"
                      value={editedPersonalInfo.gender || ""}
                      onChange={handlePersonalInfoChange}
                      label="Gender"
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                    {personalInfoErrors.gender && (
                      <FormHelperText>{personalInfoErrors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSavePersonalInfo}
                      disabled={isSavingPersonalInfo}
                      sx={{ 
                        backgroundColor: mode === "light" ? "#D32F2F" : "#f44336",
                        '&:hover': {
                          backgroundColor: mode === "light" ? "#B71C1C" : "#d32f2f",
                        }
                      }}
                    >
                      {isSavingPersonalInfo ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                border: "1px solid",
                borderColor: mode === "light" ? "#ccc" : "#444",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                    variant="outlined"
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MuiIconButton
                            aria-label="toggle current password visibility"
                            onClick={() => togglePasswordVisibility("currentPassword")}
                            edge="end"
                          >
                            {showPasswords.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </MuiIconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                    variant="outlined"
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MuiIconButton
                            aria-label="toggle new password visibility"
                            onClick={() => togglePasswordVisibility("newPassword")}
                            edge="end"
                          >
                            {showPasswords.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </MuiIconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                    variant="outlined"
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <MuiIconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => togglePasswordVisibility("confirmPassword")}
                            edge="end"
                          >
                            {showPasswords.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </MuiIconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      sx={{ 
                        backgroundColor: mode === "light" ? "#D32F2F" : "#f44336",
                        '&:hover': {
                          backgroundColor: mode === "light" ? "#B71C1C" : "#d32f2f",
                        }
                      }}
                    >
                      {isChangingPassword ? <CircularProgress size={24} /> : "Change Password"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorProfile;