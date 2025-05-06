import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Card, CardContent, 
  Grid, Divider, Chip, CircularProgress, Tabs, Tab, Paper,
  Accordion, AccordionSummary, AccordionDetails, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert, Modal
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "axios";
import paymentService from "../api/paymentService";
import addressService from "../api/addressService";

const drawerWidth = 240;

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper function to get status color
const getStatusColor = (status) => {
  const statusMap = {
    PENDING: "#FF9800",
    PROCESSING: "#2196F3",
    SHIPPED: "#9C27B0",
    DELIVERED: "#4CAF50",
    COMPLETED: "#4CAF50",
    CANCELLED: "#F44336",
    FAILED: "#F44336",
    REFUNDED: "#FF9800"
  };
  return statusMap[status] || "#9E9E9E";
};

const MyPurchase = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({open: false, message: '', type: 'info'});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    
    if (!token || !userId) {
      setIsModalOpen(true);
      return;
    }

    // Fetch both orders and payments
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersResponse = await axios.get(
          `https://it342-g5-cartella.onrender.com/api/orders/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Make sure orders is an array before setting state
        if (Array.isArray(ordersResponse.data)) {
          // Enhance orders with complete address information
          let enhancedOrders = await fetchOrderAddresses(ordersResponse.data);
          
          // Additionally enhance orders with complete product information
          enhancedOrders = await enhanceOrderItemsWithProducts(enhancedOrders);
          
          console.log("Orders with enhanced address and product info:", enhancedOrders);
          setOrders(enhancedOrders);
        } else {
          console.error("Orders response is not an array:", ordersResponse.data);
          setOrders([]);
        }
        
        // Fetch payments
        try {
          const paymentsResponse = await paymentService.getPaymentsByUserId(userId, token);
          
          // Make sure payments is an array before setting state
          if (Array.isArray(paymentsResponse)) {
            setPayments(paymentsResponse);
          } else {
            console.error("Payments response is not an array:", paymentsResponse);
            setPayments([]);
          }
        } catch (paymentErr) {
          console.error("Error fetching payments:", paymentErr);
          setPayments([]);
        }
        
      } catch (err) {
        console.error("Error fetching purchase history:", err);
        setError("Failed to load your purchase history. Please try again later.");
        setOrders([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
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
          <ListItem key={text} onClick={() => navigate(path)} component="div">
            <IconButton sx={{ mr: 1, color: "inherit" }}>{icon}</IconButton>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <List>
        <ListItem onClick={() => setIsLogoutModalOpen(true)} component="div">
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Box>
  );

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    setIsProcessing(true);
    const token = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    
    try {
      const response = await axios.post(
        `https://it342-g5-cartella.onrender.com/api/orders/${selectedOrderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Close dialog
      setCancelDialogOpen(false);
      
      if (response.data.success) {
        // Show success notification
        setNotification({
          open: true,
          message: 'Order cancelled successfully',
          type: 'success'
        });
        
        // Refresh orders list
        const ordersResponse = await axios.get(
          `https://it342-g5-cartella.onrender.com/api/orders/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (Array.isArray(ordersResponse.data)) {
          setOrders(ordersResponse.data);
        }
      } else {
        // Show error notification
        setNotification({
          open: true,
          message: response.data.message || 'Failed to cancel order',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancelDialogOpen(false);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to cancel order',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
      setSelectedOrderId(null);
    }
  };

  const closeNotification = () => {
    setNotification({...notification, open: false});
  };

  // Fetch order addresses and enhance orders with complete address information
  const fetchOrderAddresses = async (orders) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const userId = sessionStorage.getItem("userId");
      
      if (!token || !userId || !Array.isArray(orders)) {
        return orders;
      }
      
      // Get addresses for the user
      let addresses = [];
      const email = sessionStorage.getItem("email");
      const username = sessionStorage.getItem("username");
      
      if (email) {
        console.log("Fetching addresses for email:", email);
        addresses = await addressService.getAddressesByEmail(email);
      } else if (username) {
        console.log("Fetching addresses for username:", username);
        addresses = await addressService.getAddressesByUsername(username);
      }
      
      console.log("All addresses:", addresses);
      
      // Enhance orders with address details
      const enhancedOrders = orders.map(order => {
        // If order already has complete address info, don't modify it
        if (order.address && order.address.streetAddress) {
          return order;
        }
        
        // Otherwise, try to find matching address
        const orderAddress = order.address || {};
        const addressId = orderAddress.addressId;
        
        if (addressId) {
          const fullAddress = addresses.find(addr => addr.addressId === addressId);
          if (fullAddress) {
            return {
              ...order,
              address: {
                ...orderAddress,
                ...fullAddress
              }
            };
          }
        }
        
        return order;
      });
      
      return enhancedOrders;
    } catch (error) {
      console.error("Error fetching order addresses:", error);
      return orders;
    }
  };

  // Enhance order items with complete product information
  const enhanceOrderItemsWithProducts = async (orders) => {
    try {
      const token = sessionStorage.getItem("authToken");
      
      if (!token || !Array.isArray(orders)) {
        return orders;
      }
      
      // Process each order to enhance its order items with complete product information
      const enhancedOrders = await Promise.all(orders.map(async (order) => {
        // Skip if order has no items
        if (!order.orderItems || !Array.isArray(order.orderItems) || order.orderItems.length === 0) {
          return order;
        }
        
        // Process each order item
        const enhancedItems = await Promise.all(order.orderItems.map(async (item) => {
          // Skip if item already has complete product info
          if (item.product && item.product.name && item.product.description) {
            return item;
          }
          
          // If item has product ID but incomplete product info, fetch the complete product
          if (item.product && item.product.productId) {
            try {
              console.log(`Fetching complete product info for product ID: ${item.product.productId}`);
              const productResponse = await axios.get(
                `https://it342-g5-cartella.onrender.com/api/products/${item.product.productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (productResponse.data) {
                console.log(`Enhanced product info retrieved for ID ${item.product.productId}`);
                return {
                  ...item,
                  product: productResponse.data
                };
              }
            } catch (productError) {
              console.error(`Error fetching product ${item.product.productId}:`, productError);
            }
          }
          
          return item;
        }));
        
        return {
          ...order,
          orderItems: enhancedItems
        };
      }));
      
      return enhancedOrders;
    } catch (error) {
      console.error("Error enhancing order items with products:", error);
      return orders;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: mode === "dark" ? "#3A3A3A" : "#D32F2F", color: "#fff" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={logoSrc} alt="Logo" style={{ height: 40, marginRight: 10 }} />
            <Typography variant="h2" sx={{ fontFamily: "GDS Didot, serif", fontSize: "26px", marginRight: 3 }}>
              Cartella
            </Typography>
            <Box display="flex" alignItems="center" sx={{ backgroundColor: "#fff", borderRadius: 2, px: 2, width: 400 }}>
              <IconButton onClick={handleSearch}><SearchIcon sx={{ color: "#1A1A1A" }} /></IconButton>
              <InputBase
                placeholder="Search items"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ flex: 1, color: "#000", "& input": { border: "none", outline: "none" } }}
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
          overflowY: "auto", // Add scroll capability
          height: "calc(100vh - 64px)", // Set height to enable scrolling (64px is AppBar height)
        }}
      >
        <Box maxWidth="1200px" mx="auto">
          <Typography variant="h4" gutterBottom>My Purchases</Typography>

          <Paper 
            sx={{ 
              mb: 3, 
              bgcolor: mode === "light" ? "#FFFFFF" : "#2A2A2A",
              borderRadius: 2,
              overflow: "hidden"
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleChangeTab}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
                  fontWeight: 600
                },
                '& .Mui-selected': {
                  color: mode === "light" ? "#D32F2F" : "#F48FB1",
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: mode === "light" ? "#D32F2F" : "#F48FB1",
                }
              }}
            >
              <Tab icon={<ReceiptIcon />} label="Orders" iconPosition="start" />
              <Tab icon={<PaymentIcon />} label="Payments" iconPosition="start" />
            </Tabs>
          </Paper>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3} bgcolor={mode === "light" ? "#FFF8E1" : "#3E2723"} borderRadius={2} mt={2}>
              <Typography color="error">{error}</Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }} 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          ) : tabValue === 0 ? (
            // Orders Tab
            orders.length > 0 ? (
              <Grid container spacing={3}>
                {/* Make sure to check if orders is an array before calling sort */}
                {(Array.isArray(orders) ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
                  .map((order) => (
                    <Grid item xs={12} key={order.orderId}>
                      <Accordion 
                        sx={{
                          bgcolor: mode === "light" ? "#FFFFFF" : "#2A2A2A",
                          boxShadow: mode === "light" 
                            ? "0 2px 8px rgba(0,0,0,0.1)" 
                            : "0 2px 8px rgba(0,0,0,0.3)",
                          borderRadius: '8px',
                          '&:before': { display: 'none' },
                          overflow: 'hidden',
                          mb: 2
                        }}
                      >
                        <AccordionSummary 
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <Box 
                                sx={{ 
                                  bgcolor: 'rgba(211, 47, 47, 0.1)', 
                                  borderRadius: '50%', 
                                  p: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#D32F2F'
                                }}
                              >
                                <LocalShippingIcon />
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="body1" fontWeight="600">
                                Order #{order.orderId}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {formatDate(order.createdAt)}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="body2" color="text.secondary">
                                <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {order.address ? `${order.address.city}, ${order.address.country}` : 'Address not available'}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography variant="body1" fontWeight="600">
                                ₱{order.totalAmount.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Chip 
                                label={order.status} 
                                sx={{ 
                                  bgcolor: getStatusColor(order.status) + '20',
                                  color: getStatusColor(order.status),
                                  fontWeight: '600'
                                }} 
                              />
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box p={2}>
                            <Typography variant="h6" gutterBottom>Order Items</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {order.orderItems && order.orderItems.length > 0 ? (
                              order.orderItems.map((item) => (
                                <Box key={item.orderItemId} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={7}>
                                      <Typography variant="body1" fontWeight="600">
                                        {item.product && (item.product.name || item.product.productId) ? 
                                          item.product.name : 
                                          (item.productName || "Product Unavailable")}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {item.product && item.product.description ? 
                                          item.product.description : 
                                          (item.productDescription || "No description available")}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography variant="body2">
                                        Quantity: {item.quantity}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                                      <Typography variant="body1" fontWeight="600">
                                        ₱{item.priceAtTimeOfOrder.toLocaleString()}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        per item
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              ))
                            ) : (
                              <Typography color="text.secondary">No items found for this order.</Typography>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Card sx={{ bgcolor: mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.05)", height: '100%' }}>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                      <LocationOnIcon sx={{ mr: 1 }} /> Shipping Address
                                    </Typography>
                                    {order.address ? (
                                      <>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Full Name:</strong> {order.address.fullName || order.user?.username || "Not provided"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Street Address:</strong> {order.address.streetAddress || "No street address provided"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>City/Region:</strong> {order.address.city ? 
                                            `${order.address.city}${order.address.state ? `, ${order.address.state}` : ""}` : 
                                            "No city information provided"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                          <strong>Postal Code:</strong> {order.address.postalCode || "Not provided"}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>Country:</strong> {order.address.country || "No country information provided"}
                                        </Typography>
                                        {order.address.phoneNumber && (
                                          <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Phone:</strong> {order.address.phoneNumber}
                                          </Typography>
                                        )}
                                      </>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Address information not available.
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Card sx={{ bgcolor: mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.05)", height: '100%' }}>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                      <ReceiptIcon sx={{ mr: 1 }} /> Order Summary
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                      <Typography variant="body2">Status:</Typography>
                                      <Chip 
                                        label={order.status} 
                                        size="small"
                                        sx={{ 
                                          bgcolor: getStatusColor(order.status) + '20',
                                          color: getStatusColor(order.status),
                                          fontWeight: '600'
                                        }} 
                                      />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                      <Typography variant="body2">Order Date:</Typography>
                                      <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                      <Typography variant="body2">Last Updated:</Typography>
                                      <Typography variant="body2">{formatDate(order.updatedAt)}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="body1" fontWeight="600">Total:</Typography>
                                      <Typography variant="body1" fontWeight="600">₱{order.totalAmount.toLocaleString()}</Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                            
                            {/* Only show cancel button for PENDING orders */}
                            {order.status === 'PENDING' && (
                              <Box mt={3} display="flex" justifyContent="flex-end">
                                <Button 
                                  variant="contained" 
                                  color="error" 
                                  onClick={() => handleCancelOrder(order.orderId)}
                                  startIcon={<i className="fas fa-times-circle"></i>}
                                >
                                  Cancel Order
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Box p={5} textAlign="center" bgcolor={mode === "light" ? "#F5F5F5" : "#2A2A2A"} borderRadius={2}>
                <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No Orders Yet</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  You haven't placed any orders yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="small" 
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    bgcolor: "#D32F2F",
                    "&:hover": { bgcolor: "#B71C1C" },
                    textTransform: "none",
                    fontWeight: "100",
                    fontSize: "1rem",
                    color: "#fff"
                  }}
                >
                  Browse Products
                </Button>
              </Box>
            )
          ) : (
            // Payments Tab
            payments.length > 0 ? (
              <Grid container spacing={3}>
                {/* Make sure to check if payments is an array before calling sort */}
                {(Array.isArray(payments) ? [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
                  .map((payment) => (
                    <Grid item xs={12} key={payment.paymentId}>
                      <Card 
                        sx={{
                          bgcolor: mode === "light" ? "#FFFFFF" : "#2A2A2A",
                          boxShadow: mode === "light" 
                            ? "0 2px 8px rgba(0,0,0,0.1)" 
                            : "0 2px 8px rgba(0,0,0,0.3)",
                          borderRadius: '8px',
                          p: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: getStatusColor(payment.status)
                          }
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <CreditCardIcon sx={{ mr: 1, color: mode === "light" ? "#757575" : "#BDBDBD" }} />
                              <Typography variant="h6">
                                Payment #{payment.paymentId}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              Date: {formatDate(payment.createdAt)}
                            </Typography>
                            {payment.order && (
                              <Typography variant="body2" color="text.secondary">
                                Order Reference: #{payment.order.orderId}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Payment Method
                            </Typography>
                            <Typography variant="body1">
                              {payment.paymentMethod || "Credit Card"}
                            </Typography>
                            {payment.stripeSessionId && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                                Stripe Session ID: {payment.stripeSessionId.substring(0, 10)}...
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                              <Typography variant="h6" color="primary" gutterBottom>
                                {payment.currency.toUpperCase()} {payment.amount.toLocaleString()}
                              </Typography>
                              <Chip 
                                label={payment.status} 
                                sx={{ 
                                  bgcolor: getStatusColor(payment.status) + '20',
                                  color: getStatusColor(payment.status),
                                  fontWeight: '600'
                                }} 
                              />
                              {payment.status === 'COMPLETED' && payment.order && payment.order.status === 'DELIVERED' && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  Payment completed after order delivery
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Box p={5} textAlign="center" bgcolor={mode === "light" ? "#F5F5F5" : "#2A2A2A"} borderRadius={2}>
                <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No Payment History</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  You don't have any payment records yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="small" 
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    bgcolor: "#D32F2F",
                    "&:hover": { bgcolor: "#B71C1C" },
                    textTransform: "none",
                    fontWeight: "100",
                    fontSize: "1rem",
                    color: "#fff"
                  }}
                >
                  Start Shopping
                </Button>
              </Box>
            )
          )}
        </Box>
      </Box>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !isProcessing && setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel this order? This action cannot be undone.
            Products will be returned to inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            disabled={isProcessing}
            color="primary"
          >
            No, Keep Order
          </Button>
          <Button 
            onClick={confirmCancelOrder} 
            color="error" 
            disabled={isProcessing}
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isProcessing ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

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
    </Box>
  );
};

export default MyPurchase;
