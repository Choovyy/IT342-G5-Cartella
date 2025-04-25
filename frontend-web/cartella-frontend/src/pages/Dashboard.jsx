import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Grid
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

import ClothesImg from "../images/clothes.png";
import BlenderImg from "../images/blender.png";
import WatchImg from "../images/watch.png";
import ShadesImg from "../images/shades.png";
import IphoneImg from "../images/iphone.png";
import GamingImg from "../images/gaming.png";

const drawerWidth = 240;

const Dashboard = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      alert("You must be logged in to access the dashboard.");
      navigate("/login");
      return;
    }

    axios
      .get("/login", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("Error verifying auth:", error);
        alert("Session expired. Please log in again.");
        sessionStorage.removeItem("authToken");
        navigate("/login");
      });
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

  const logoSrc =
    mode === "light"
      ? "src/images/Cartella Logo (Light).jpeg"
      : "src/images/Cartella Logo (Dark2).jpeg";

  const categories = [
  { name: "Clothes", image: ClothesImg, path: "/category/clothes" },
  { name: "Men's Accessories", image: WatchImg, path: "/category/mens-accessories" },
  { name: "Mobiles & Gadgets", image: IphoneImg, path: "/category/mobiles-gadgets" },
  { name: "Home Appliances", image: BlenderImg, path: "/category/home-appliances" },
  { name: "Women's Accessories", image: ShadesImg, path: "/category/womens-accessories" },
  { name: "Gaming", image: GamingImg, path: "/category/gaming" },
];

  const itemStyle = {
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
    },
  };

  const imageStyle = {
    width: "230px",
    height: "250px",
    mb: 1,
  };

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
      {/* App Bar */}
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
            <Typography
              variant="h2"
              sx={{
                fontFamily: "GDS Didot, serif",
                fontSize: "26px",
                color: "inherit",
                marginRight: 3,
              }}
            >
              Cartella
            </Typography>

            {/* Search Bar */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                px: 2,
                width: 400,
              }}
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

          {/* Theme Toggle */}
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
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

      {/* Main Content */}
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
          <Typography variant="h4" gutterBottom>Categories</Typography>
          <Grid container spacing={20} justifyContent="center">
            {/* Top Row */}
            {[0, 1, 2].map((i) => {
              const { name, image, path } = categories[i];
              return (
                <Grid item xs={12} sm={4} md={4} key={name} onClick={() => navigate(path)} sx={itemStyle}>
                  <Box component="img" src={image} alt={name} sx={imageStyle} />
                  <Typography variant="subtitle1">{name}</Typography>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={20} sx={{ mt: 1 }} justifyContent="center">
            {/* Bottom Row */}
            {[3, 4, 5].map((i) => {
              const { name, image, path } = categories[i];
              return (
                <Grid item xs={12} sm={4} md={4} key={name} onClick={() => navigate(path)} sx={itemStyle}>
                  <Box component="img" src={image} alt={name} sx={imageStyle} />
                  <Typography variant="subtitle1">{name}</Typography>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
