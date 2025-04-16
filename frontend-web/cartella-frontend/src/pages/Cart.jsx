import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Button, Checkbox, Divider
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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const drawerWidth = 240;

const Cart = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");

  // Cart logic
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Women’s Sunglasses",
      price: 40,
      quantity: 1,
      image: "🕶️"
    },
    {
      id: 2,
      name: "Logitech Joystick",
      price: 1400,
      quantity: 2,
      image: "🎮"
    }
  ]);
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleQtyChange = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
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

  const logoSrc =
    mode === "light"
      ? "src/images/Cartella Logo (Light).jpeg"
      : "src/images/Cartella Logo (Dark2).jpeg";

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
            <Typography variant="h2" sx={{ fontFamily: "GDS Didot, serif", fontSize: "26px", color: "inherit", marginRight: 3 }}>
              Cartella
            </Typography>
            <Box display="flex" alignItems="center" sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
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
                  "& input": { border: "none", outline: "none" },
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
        }}
      >
        <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

          <Box>
  {/* Header Row + Add Items Button */}
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={1}>
    <Box flex={1}><Typography fontWeight="bold">Product</Typography></Box>
    <Box sx={{ width: 100 }}><Typography fontWeight="bold">Unit Price</Typography></Box>
    <Box sx={{ width: 100 }}><Typography fontWeight="bold">Quantity</Typography></Box>
    <Box sx={{ width: 120 }}><Typography fontWeight="bold">Total Price</Typography></Box>
    <Box sx={{ width: 100 }} display="flex" justifyContent="space-between" alignItems="center">
      <Typography fontWeight="bold">Actions</Typography>
      <Button variant="outlined" size="small" onClick={() => navigate('/dashboard')}>
        Add Items
      </Button>
    </Box>
  </Box>
          {cartItems.map((item) => (
            <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" flex={1}>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                />
                <Typography fontSize={24} mr={2}>{item.image}</Typography>
                <Typography>{item.name}</Typography>
              </Box>
              <Typography sx={{ width: 100 }}>₱{item.price.toFixed(2)}</Typography>
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => handleQtyChange(item.id, -1)}><RemoveIcon /></IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton onClick={() => handleQtyChange(item.id, 1)}><AddIcon /></IconButton>
              </Box>
              <Typography sx={{ width: 120 }}>
                ₱{(item.price * item.quantity).toFixed(2)}
              </Typography>
              <IconButton onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                onChange={toggleSelectAll}
              />
              <Typography>Select All</Typography>
            </Box>
            <Typography fontWeight="bold">Total ({selectedItems.length} item{selectedItems.length !== 1 && 's'}): ₱{totalPrice.toFixed(2)}</Typography>
            <Button variant="contained" color="error" disabled={selectedItems.length === 0}>
              Check Out
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Cart;
