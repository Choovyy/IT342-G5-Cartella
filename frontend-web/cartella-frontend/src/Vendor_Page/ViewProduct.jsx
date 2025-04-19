import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputBase,
  Button
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

import longsleeveImg from "../images/longsleeve.png";

const drawerWidth = 240;

const ViewProduct = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = React.useState("");

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

  const product = {
    name: "Nike Longsleeve",
    price: 400,
    description:
      "A stylish and comfortable Nike longsleeve shirt designed for performance and everyday wear.",
    stock: 50,
    image: longsleeveImg,
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
            <img
              src={logoSrc}
              alt="Logo"
              style={{ height: 40, marginRight: 10 }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: "26px",
                marginRight: 3,
                fontFamily: "GDS Didot, serif",
              }}
            >
              Cartella
            </Typography>
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
          overflow: "auto",
          height: "92vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 7 }}>
          Product Details
        </Typography>

        <Box
          sx={{
            display: "flex",
            maxWidth: 900,
            margin: "auto",
            backgroundColor: mode === "light" ? "#f9f9f9" : "#2A2A2A",
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "flex-start",
            gap: 4,
          }}
        >
          {/* Left: Product Image */}
          <Box sx={{ flex: 1 }}>
            <img
              src={product.image}
              alt="Product"
              style={{ width: "100%", maxWidth: 300, borderRadius: 10 }}
            />
          </Box>

          {/* Right: Info */}
          <Box sx={{ flex: 1, pl: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" sx={{ mb: 1, mt:2 }}>
              {product.name}
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>
              ₱ {product.price}.00
            </Typography>

            <Typography variant="body1" sx={{ mb: 12 }}>
              {product.description}
            </Typography>

            <Typography variant="h6" sx={{ mb: 14 }}>
              Stocks: {product.stock} left
            </Typography>

            <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  width: 130,
                  height: 40,
                  backgroundColor: "#D32F2E",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontSize: "16px",
                  "&:hover": {
                    backgroundColor: "#b71c1c",
                  },
                }}
              >
                Delete
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/vendor-edit-product")}
                sx={{
                  width: 130,
                  height: 40,
                  backgroundColor: "#1976D2",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontSize: "16px",
                  "&:hover": {
                    backgroundColor: "#115293",
                  },
                }}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewProduct;
