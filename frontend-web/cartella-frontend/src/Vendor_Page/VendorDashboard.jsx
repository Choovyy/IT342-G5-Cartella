import React, { useContext, useEffect, useState } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase
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

import {
  LineChart,
  lineElementClasses,
  axisClasses,
  legendClasses,
  chartsGridClasses
} from "@mui/x-charts";

const drawerWidth = 240;

const gray = {
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  500: "#9e9e9e",
  700: "#616161",
  900: "#212121"
};

export const chartsCustomizations = {
  MuiChartsAxis: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${axisClasses.line}`]: { stroke: gray[300] },
        [`& .${axisClasses.tick}`]: { stroke: gray[300] },
        [`& .${axisClasses.tickLabel}`]: {
          fill: gray[500],
          fontWeight: 500,
        },
        ...(theme.applyStyles && theme.applyStyles("dark", {
          [`& .${axisClasses.line}`]: { stroke: gray[700] },
          [`& .${axisClasses.tick}`]: { stroke: gray[700] },
          [`& .${axisClasses.tickLabel}`]: { fill: gray[300], fontWeight: 500 },
        })),
      }),
    },
  },
  MuiChartsTooltip: {
    styleOverrides: {
      mark: ({ theme }) => ({
        ry: 6,
        boxShadow: "none",
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
      }),
      table: ({ theme }) => ({
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        background: "hsl(0, 0%, 100%)",
        ...(theme.applyStyles && theme.applyStyles("dark", {
          background: gray[900],
        })),
      }),
    },
  },
  MuiChartsLegend: {
    styleOverrides: {
      root: {
        [`& .${legendClasses.mark}`]: { ry: 6 },
      },
    },
  },
  MuiChartsGrid: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${chartsGridClasses.line}`]: {
          stroke: gray[200],
          strokeDasharray: "4 2",
          strokeWidth: 0.8,
        },
        ...(theme.applyStyles && theme.applyStyles("dark", {
          [`& .${chartsGridClasses.line}`]: {
            stroke: gray[700],
            strokeDasharray: "4 2",
            strokeWidth: 0.8,
          },
        })),
      }),
    },
  },
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");

  const [userDetails, setUserDetails] = useState({
    username: "",
    userId: "",
    vendorId: "",
  });

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    products: [10, 20, 30, 34],
    orders: [40, 60, 80, 118],
    revenue: [3450, 2980, 4100, 3340],
  };

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");
    const vendorId = sessionStorage.getItem("vendorId");
    setUserDetails({ username, userId, vendorId });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
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
            <Typography variant="h2" sx={{ fontSize: "26px", marginRight: 3,  fontFamily: "GDS Didot, serif" }}>
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
          color: mode === "light" ? "#000" : "#FFF",
          p: 3,
          mt: 8,
          overflow: "auto",
          height: "92vh",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Sales Overview
        </Typography>
        <Typography variant="h6">
          Welcome, {userDetails.username || "Vendor"}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Business Name Cartella Co.<br />
          Joined Date March 2024
        </Typography>

        {/* Charts Section */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, my: 4, flexWrap: "wrap" }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: mode === "light" ? "#ccc" : "#444",
              borderRadius: 2,
              p: 2,
              backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
            }}
          >
            <Typography variant="h6" align="center">Total Orders</Typography>
            <LineChart
              xAxis={[{ data: chartData.labels }]}
              series={[{ data: chartData.orders, label: "Orders", color: "#F44336" }]}
              width={480}
              height={280}
              sx={{ [`& .${lineElementClasses.root}`]: { strokeWidth: 2 } }}
            />
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: mode === "light" ? "#ccc" : "#444",
              borderRadius: 2,
              p: 2,
              backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
            }}
          >
            <Typography variant="h6" align="center">Total Products</Typography>
            <LineChart
              xAxis={[{ data: chartData.labels }]}
              series={[{ data: chartData.products, label: "Products", color: "#2196F3" }]}
              width={480}
              height={280}
              sx={{ [`& .${lineElementClasses.root}`]: { strokeWidth: 2 } }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: mode === "light" ? "#ccc" : "#444",
              borderRadius: 2,
              p: 2,
              backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
            }}
          >
            <Typography variant="h6" align="center">Total Revenue</Typography>
            <LineChart
              xAxis={[{ data: chartData.labels }]}
              series={[{ data: chartData.revenue, label: "Revenue ($)", color: "#4CAF50" }]}
              width={1000}
              height={280}
              sx={{ [`& .${lineElementClasses.root}`]: { strokeWidth: 2 } }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VendorDashboard;
