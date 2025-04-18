import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Grid
} from "@mui/material";

import { ColorModeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import LightLogo from "../images/Cartella Logo (Light).jpeg";
import DarkLogo from "../images/Cartella Logo (Dark2).jpeg";
import LongsleeveImg from "../images/longsleeve.png";
import DressImg from "../images/dress.png";

const drawerWidth = 240;

const VendorClothes = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const logoSrc = mode === "light" ? LightLogo : DarkLogo;

  const categories = [
    { name: "Men’s Apparel", image: LongsleeveImg, path: "/vendor-men-apparel" },
    { name: "Women’s Apparel", image: DressImg, path: "/vendor-women-apparel" },
  ];

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
        }}
      >
        <Typography variant="h4" gutterBottom>Clothes Categories</Typography>
        <Grid container spacing={25} justifyContent="center" sx={{ maxWidth: 900, mt: 11, mx: 'auto' }}>
          {categories.map(({ name, image, path }) => (
            <Grid item xs={12} sm={4} md={4} key={name} onClick={() => navigate(path)} sx={{
              cursor: "pointer",
              textAlign: "center",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}>
              <Box component="img" src={image} alt={name} sx={{ width: "330px", height: "370px", mb: 1 }} />
              <Typography variant="subtitle1">{name}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default VendorClothes;
