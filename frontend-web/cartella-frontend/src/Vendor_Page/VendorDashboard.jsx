import React, { useContext, useEffect, useState } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, CircularProgress, Modal, Button
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../ThemeContext";
import { toast, ToastContainer } from "react-toastify";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logoLight from "../images/Cartella Logo (Light).jpeg";
import logoDark from "../images/Cartella Logo (Dark2).jpeg";

import {
  LineChart,
  lineElementClasses,
} from "@mui/x-charts";

const drawerWidth = 240;

const VendorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: "",
    userId: "",
    vendorId: "",
    businessName: "",
    joinedDate: "",
  });

  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalSoldItems: 0,
  });

  const [chartData, setChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr"],
    products: [0, 0, 0, 0],
    orders: [0, 0, 0, 0],
    revenue: [0, 0, 0, 0],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");
    const vendorId = sessionStorage.getItem("vendorId");
    const businessName = sessionStorage.getItem("businessName");
    const joinedDate = sessionStorage.getItem("joinedDate");
    const authToken = sessionStorage.getItem("authToken");

    if (!authToken || !vendorId) {
      setIsModalOpen(true);
      return;
    }

    setUserDetails({ username, userId, vendorId, businessName, joinedDate });

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const summaryResponse = await fetch(`https://it342-g5-cartella.onrender.com/api/vendor-dashboard/${vendorId}/summary`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!summaryResponse.ok) {
          throw new Error("Failed to fetch summary data");
        }

        const summaryData = await summaryResponse.json();

        setUserDetails((prev) => ({
          ...prev,
          businessName: summaryData.businessName || prev.businessName,
          joinedDate: summaryData.joinedDate || prev.joinedDate,
        }));

        setDashboardData({
          totalProducts: summaryData.totalProducts || 0,
          totalOrders: summaryData.totalOrders || 0,
          totalRevenue: summaryData.totalRevenue || 0,
          totalSoldItems: summaryData.totalSoldItems || 0,
        });

        const chartResponse = await fetch(`https://it342-g5-cartella.onrender.com/api/vendor-dashboard/${vendorId}/chart-data`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!chartResponse.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const chartData = await chartResponse.json();

        setChartData({
          labels: chartData.labels || ["Jan", "Feb", "Mar", "Apr"],
          products: chartData.products || [0, 0, 0, 0],
          orders: chartData.orders || [0, 0, 0, 0],
          revenue: chartData.revenue || [0, 0, 0, 0],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        toast.error("Failed to load dashboard data. Please try again later.", {
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
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate("/vendor-login");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("vendorId");
    sessionStorage.removeItem("businessName");
    sessionStorage.removeItem("joinedDate");
    navigate("/vendor-login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
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
        <ListItem button onClick={() => setIsLogoutModalOpen(true)}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
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
          Business Name: {userDetails.businessName || "Cartella Co."}<br />
          Joined Date: {userDetails.joinedDate || "March 2024"}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, my: 4, flexWrap: "wrap" }}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: mode === "light" ? "#ccc" : "#444",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                  flex: 1,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">Total Products</Typography>
                <Typography variant="h4">{dashboardData.totalProducts}</Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: mode === "light" ? "#ccc" : "#444",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                  flex: 1,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">{dashboardData.totalOrders}</Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: mode === "light" ? "#ccc" : "#444",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                  flex: 1,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">₱{dashboardData.totalRevenue.toLocaleString()}</Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: mode === "light" ? "#ccc" : "#444",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: mode === "light" ? "#fff" : "#2a2a2a",
                  flex: 1,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">Total Sold Items</Typography>
                <Typography variant="h4">{dashboardData.totalSoldItems}</Typography>
              </Box>
            </Box>

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
                  xAxis={[{ data: chartData.labels, scaleType: 'point' }]}
                  series={[{
                    data: chartData.orders,
                    label: "Orders",
                    color: "#F44336",
                    area: true,
                    showMark: true,
                    curve: "linear",
                  }]}
                  width={480}
                  height={280}
                  sx={{
                    '.MuiLineElement-root': {
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                    },
                    '.MuiMarkElement-root': {
                      stroke: '#F44336',
                      scale: '0.6',
                      fill: '#fff',
                      strokeWidth: 2,
                    },
                  }}
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
                  xAxis={[{ data: chartData.labels, scaleType: 'point' }]}
                  series={[{
                    data: chartData.products,
                    label: "Products",
                    color: "#2196F3",
                    area: true,
                    showMark: true,
                    curve: "linear",
                  }]}
                  width={480}
                  height={280}
                  sx={{
                    '.MuiLineElement-root': {
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                    },
                    '.MuiMarkElement-root': {
                      stroke: '#2196F3',
                      scale: '0.6',
                      fill: '#fff',
                      strokeWidth: 2,
                    },
                  }}
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
                  xAxis={[{ data: chartData.labels, scaleType: 'point' }]}
                  series={[{
                    data: chartData.revenue,
                    label: "Revenue (₱)",
                    color: "#4CAF50",
                    area: true,
                    showMark: true,
                    curve: "linear",
                  }]}
                  width={1000}
                  height={280}
                  sx={{
                    '.MuiLineElement-root': {
                      strokeWidth: 2,
                      strokeLinecap: 'round',
                    },
                    '.MuiMarkElement-root': {
                      stroke: '#4CAF50',
                      scale: '0.6',
                      fill: '#fff',
                      strokeWidth: 2,
                    },
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>

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

      <ToastContainer
        hideProgressBar={false}
        closeButton={false}
        newestOnTop={false}
        pauseOnHover={false}
        draggable={false}
        autoClose={2000}
      />
    </Box>
  );
};

export default VendorDashboard;