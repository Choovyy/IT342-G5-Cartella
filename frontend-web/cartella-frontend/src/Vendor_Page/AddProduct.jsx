import React, { useContext, useState } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Button, TextField
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

const drawerWidth = 240;

const AddProduct = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    image: null,
  });

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
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Product:", form);
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
        }}
      >
        <Typography variant="h4">Add New Product</Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "60%",
            mt: 5,
            mx: "auto",
            p: 4,
            borderRadius: 2,
            backgroundColor: mode === "light" ? "#f9f9f9" : "#2A2A2A",
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Name */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ width: 150, minWidth: 150, textAlign: "left" }}>Name</Typography>
            <TextField
              name="name"
              required
              variant="outlined"
              fullWidth
              value={form.name}
              onChange={handleChange}
            />
          </Box>

          {/* Price */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ width: 150, minWidth: 150, textAlign: "left" }}>Price</Typography>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography sx={{ px: 2 }}>₱</Typography>
              <TextField
                name="price"
                required
                type="number"
                variant="outlined"
                fullWidth
                value={form.price}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
              <Typography sx={{ px: 2 }}>.00</Typography>
            </Box>
          </Box>

          {/* Description */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ width: 150, minWidth: 150, textAlign: "left" }}>Description</Typography>
            <TextField
              name="description"
              required
              variant="outlined"
              multiline
              fullWidth
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </Box>

          {/* Stock */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ width: 150, minWidth: 150, textAlign: "left" }}>Stock</Typography>
            <TextField
              name="stock"
              required
              type="number"
              variant="outlined"
              fullWidth
              value={form.stock}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Box>

          {/* Image */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ width: 150, minWidth: 150, textAlign: "left" }}>Image</Typography>
            <input
              type="file"
              name="image"
              required
              accept="image/*"
              onChange={handleChange}
              style={{
                padding: "12px 16px",
                background: mode === "light" ? "#fff" : "#444",
                border: "1px solid #ccc",
                borderRadius: 4,
                width: "100%",
                color: mode === "light" ? "#000" : "#FFF",
              }}
            />
          </Box>

          {/* Submit Button */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: 130,
                height: 40,
                backgroundColor: "#D32F2E",
                color: "#FFFFFF",
                textTransform: "none",
                px: 2.5,
                py: 1.25,
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddProduct;
