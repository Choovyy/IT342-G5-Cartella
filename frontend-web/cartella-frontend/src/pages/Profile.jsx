import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, TextField, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
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
    gender: "",
  });

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
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

  const handleSubmit = () => {
    console.log("Profile updated:", formData);
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
          <Typography variant="body2" sx={{ mb: 4, mt: 0.5, color: "#000" }}>
            Manage and protect your account
          </Typography>
        </Box>

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
          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth />
          <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
          <TextField label="Phone number" name="phone" value={formData.phone} onChange={handleChange} fullWidth />
          <TextField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth />
          
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
      </Box>
    </Box>
  );
};

export default Profile;
