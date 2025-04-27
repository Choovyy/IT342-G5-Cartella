import React, { useContext, useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Drawer, Box, List, ListItem,
  ListItemText, IconButton, InputBase, Card, CardContent, CardActionArea,
  CircularProgress, Alert, Chip, Grid, Select, MenuItem, FormControl,
  InputLabel, Tab, Tabs, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../ThemeContext";
import orderService from "../api/orderService";
import vendorService from "../api/vendorService";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsIcon from "@mui/icons-material/Payments";

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

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch(status) {
    case 'PENDING':
      return <HourglassEmptyIcon fontSize="small" />;
    case 'PROCESSING':
      return <LocalShippingIcon fontSize="small" />;
    case 'SHIPPED':
      return <LocalShippingIcon fontSize="small" />;
    case 'DELIVERED':
      return <CheckCircleIcon fontSize="small" />;
    case 'COMPLETED':
      return <CheckCircleIcon fontSize="small" />;
    case 'CANCELLED':
      return <CancelIcon fontSize="small" />;
    default:
      return null;
  }
};

// Helper function to get next status options
const getNextStatusOptions = (currentStatus) => {
  switch(currentStatus) {
    case 'PENDING':
      return ['PROCESSING', 'CANCELLED'];
    case 'PROCESSING':
      return ['SHIPPED', 'CANCELLED'];
    case 'SHIPPED':
      return ['DELIVERED', 'CANCELLED'];
    case 'DELIVERED':
      return ['COMPLETED'];
    default:
      return [];
  }
};

// Helper function to get a user-friendly status description
const getStatusDescription = (status) => {
  const descriptions = {
    PENDING: "Order received and awaiting processing",
    PROCESSING: "Order is being processed",
    SHIPPED: "Order has been shipped",
    DELIVERED: "Order has been delivered to the customer",
    COMPLETED: "Order has been completed",
    CANCELLED: "Order has been cancelled"
  };
  return descriptions[status] || status;
};

const Order = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ColorModeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [tabValue, setTabValue] = useState(0);
  
  // For order status update
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });

  // Count orders by status
  const orderCounts = {
    pending: orders.filter(order => order.status === "PENDING").length,
    processing: orders.filter(order => order.status === "PROCESSING").length,
    shipped: orders.filter(order => order.status === "SHIPPED").length,
    delivered: orders.filter(order => order.status === "DELIVERED").length
  };

  // For order payment details
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply filters and sorting whenever orders, search, or filters change
    filterAndSortOrders();
  }, [orders, searchText, statusFilter, sortOption, tabValue]);

  const fetchOrders = async () => {
    const authToken = sessionStorage.getItem("authToken");
    const vendorId = sessionStorage.getItem("vendorId");
    
    if (!authToken || !vendorId) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch orders using vendorService
      const data = await vendorService.getVendorOrders(vendorId);
      
      if (Array.isArray(data)) {
        console.log("Orders received from backend:", data);
        setOrders(data);
      } else {
        console.error("Orders response is not an array:", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];
    
    // First apply tab filter (active/completed/cancelled)
    if (tabValue === 0) {
      // Active orders (PENDING, PROCESSING, SHIPPED)
      filtered = filtered.filter(order => 
        ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)
      );
    } else if (tabValue === 1) {
      // Completed orders
      filtered = filtered.filter(order => order.status === 'DELIVERED' || order.status === 'COMPLETED');
    } else if (tabValue === 2) {
      // Cancelled orders
      filtered = filtered.filter(order => order.status === 'CANCELLED');
    }
    
    // Then apply status filter if not "ALL"
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter if there's search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(order => 
        (order.product.name && order.product.name.toLowerCase().includes(search)) ||
        (order.customer && order.customer.name && order.customer.name.toLowerCase().includes(search)) ||
        order.orderId.toString().includes(search)
      );
    }
    
    // Apply sort
    if (sortOption === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "highValue") {
      filtered.sort((a, b) => b.product.price * b.quantity - a.product.price * a.quantity);
    } else if (sortOption === "lowValue") {
      filtered.sort((a, b) => a.product.price * a.quantity - b.product.price * b.quantity);
    }
    
    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    
    // Set the logical next status based on current status
    let suggestedStatus = "";
    switch(order.status) {
      case "PENDING":
        suggestedStatus = "PROCESSING";
        break;
      case "PROCESSING":
        suggestedStatus = "SHIPPED";
        break;
      case "SHIPPED":
        suggestedStatus = "DELIVERED";
        break;
      default:
        suggestedStatus = order.status;
    }
    
    setNewStatus(suggestedStatus);
    setUpdateStatusDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setProcessingUpdate(true);
    
    try {
      // Use orderService instead of direct axios call
      await orderService.updateOrderStatus(selectedOrder.orderId, newStatus);
      
      // Show success notification
      setNotification({
        open: true,
        message: `Order #${selectedOrder.orderId} updated to ${newStatus}`,
        type: "success"
      });
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.orderId === selectedOrder.orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
    } catch (error) {
      console.error("Error updating order status:", error);
      
      // Show error notification
      setNotification({
        open: true,
        message: `Failed to update order: ${error.message}`,
        type: "error"
      });
    } finally {
      setUpdateStatusDialog(false);
      setProcessingUpdate(false);
      setSelectedOrder(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("vendorId");
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("Searching for:", searchText);
    }
  };

  const handleCardClick = (orderId) => {
    navigate(`/vendor-view-order/${orderId}`);
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

  const fetchOrderWithPaymentDetails = async (orderId) => {
    try {
      setLoadingPaymentDetails(true);
      // Use orderService instead of direct axios call
      const data = await orderService.getOrderWithPaymentDetails(orderId);
      setSelectedOrderDetails(data);
      setPaymentDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching order payment details:", error);
      setNotification({
        open: true,
        message: `Failed to load payment details: ${error.message}`,
        type: "error"
      });
    } finally {
      setLoadingPaymentDetails(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
          color: mode === "light" ? "#000" : "#FFF",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1, maxWidth: 500 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: mode === "light" ? "#F5F5F5" : "#333", 
                borderRadius: 2, 
                px: 2, 
                width: '100%' 
              }}
            >
              <IconButton onClick={handleSearch} size="small">
                <SearchIcon sx={{ color: mode === "light" ? "#757575" : "#BBB" }} />
              </IconButton>
              <InputBase
                placeholder="Search orders by product name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ ml: 1, flex: 1 }}
              />
              {searchText && (
                <IconButton onClick={() => setSearchText("")} size="small">
                  <CancelIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Box display="flex" gap={2}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
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
        <Box maxWidth="1400px" mx="auto">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Orders Management</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FilterListIcon />}
              onClick={() => fetchOrders()}
              sx={{
                bgcolor: "#D32F2F",
                "&:hover": { bgcolor: "#B71C1C" }
              }}
            >
              Refresh Orders
            </Button>
          </Box>
          
          {/* Order Statistics */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  bgcolor: mode === "light" ? "#fff" : "#2A2A2A",
                  borderLeft: '4px solid #FF9800'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">PENDING</Typography>
                <Typography variant="h4" fontWeight="bold">{orderCounts.pending}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  bgcolor: mode === "light" ? "#fff" : "#2A2A2A",
                  borderLeft: '4px solid #2196F3'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">PROCESSING</Typography>
                <Typography variant="h4" fontWeight="bold">{orderCounts.processing}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  bgcolor: mode === "light" ? "#fff" : "#2A2A2A",
                  borderLeft: '4px solid #9C27B0'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">SHIPPED</Typography>
                <Typography variant="h4" fontWeight="bold">{orderCounts.shipped}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  bgcolor: mode === "light" ? "#fff" : "#2A2A2A",
                  borderLeft: '4px solid #4CAF50'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">DELIVERED</Typography>
                <Typography variant="h4" fontWeight="bold">{orderCounts.delivered}</Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Order Filters */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 500
                },
                '& .Mui-selected': {
                  color: mode === "light" ? "#D32F2F" : "#F48FB1",
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: mode === "light" ? "#D32F2F" : "#F48FB1",
                }
              }}
            >
              <Tab 
                label={
                  <Box display="flex" alignItems="center">
                    <Badge badgeContent={
                      orders.filter(order => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status)).length
                    } color="error" max={99}>
                      <Typography>Active</Typography>
                    </Badge>
                  </Box>
                } 
              />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
            
            <Box display="flex" gap={2}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  sx={{ bgcolor: mode === "light" ? "#f5f5f5" : "#2A2A2A" }}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  label="Sort By"
                  sx={{ bgcolor: mode === "light" ? "#f5f5f5" : "#2A2A2A" }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="highValue">Highest Value</MenuItem>
                  <MenuItem value="lowValue">Lowest Value</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : filteredOrders.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
              <Box sx={{ mb: 2, opacity: 0.7 }}>
                <ListAltIcon sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h6" gutterBottom>No orders found</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {searchText 
                  ? "No orders match your search criteria. Try adjusting your search."
                  : "You don't have any orders in this category yet."}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredOrders.map(order => (
                <Grid item xs={12} key={order.orderId}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      bgcolor: mode === "light" ? "#fff" : "#2A2A2A",
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: getStatusColor(order.status)
                      }
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <Box 
                              sx={{ 
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1,
                                border: '1px solid',
                                borderColor: mode === "light" ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                                overflow: 'hidden'
                              }}
                            >
                              {order.product?.imageUrl ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${order.product.imageUrl}`}
                                  alt={order.product.name}
                                  style={{ width: '100%', height: '100%', objectFit: "contain" }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#eee",
                                  }}
                                >
                                  <Typography variant="caption">No Image</Typography>
                                </Box>
                              )}
                            </Box>
                            
                            <Box sx={{ flex: 1 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Typography variant="h6" component="h2">
                                    {order.product?.name || "Product Name Unavailable"}
                                  </Typography>
                                  
                                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                    <Typography variant="body2" color="text.secondary">
                                      Order #{order.orderId}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                      {formatDate(order.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Chip 
                                  icon={getStatusIcon(order.status)}
                                  label={order.status} 
                                  sx={{ 
                                    bgcolor: getStatusColor(order.status) + '20',
                                    color: getStatusColor(order.status),
                                    fontWeight: 500
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {order.product?.description?.substring(0, 150) || "No description available"}
                                {order.product?.description?.length > 150 ? "..." : ""}
                              </Typography>
                              
                              <Box mt={1}>
                                <Typography variant="body2">
                                  Quantity: <strong>{order.quantity}</strong>
                                </Typography>
                                <Typography variant="body2">
                                  Price: <strong>₱{order.product?.price?.toLocaleString() || "N/A"}</strong>
                                </Typography>
                                <Typography variant="body2">
                                  Total: <strong>₱{((order.product?.price || 0) * order.quantity).toLocaleString()}</strong>
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box 
                            sx={{ 
                              height: '100%', 
                              borderLeft: { xs: 'none', md: `1px solid ${mode === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` },
                              pl: { xs: 0, md: 2 },
                              pt: { xs: 2, md: 0 },
                              mt: { xs: 2, md: 0 },
                              borderTop: { xs: `1px solid ${mode === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`, md: 'none' },
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Customer Information
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>{order.customer?.name || "Customer Name Unavailable"}</strong>
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              {order.address ? 
                                `${order.address.streetAddress}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}` : 
                                (order.shippingAddress || "Shipping Address Unavailable")}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleCardClick(order.orderId)}
                                fullWidth
                              >
                                View Details
                              </Button>
                              
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => fetchOrderWithPaymentDetails(order.orderId)}
                                fullWidth
                                color="info"
                                startIcon={<CreditCardIcon />}
                              >
                                Payment Info
                              </Button>
                              
                              {['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                                <Button 
                                  variant="contained" 
                                  color="primary"
                                  size="small"
                                  onClick={() => handleUpdateStatus(order)}
                                  fullWidth
                                  sx={{
                                    bgcolor: "#D32F2F",
                                    "&:hover": { bgcolor: "#B71C1C" }
                                  }}
                                >
                                  Update Status
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
      
      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialog}
        onClose={() => !processingUpdate && setUpdateStatusDialog(false)}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change the status for Order #{selectedOrder?.orderId}.
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
              disabled={processingUpdate}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUpdateStatusDialog(false)} 
            disabled={processingUpdate}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={processingUpdate}
            startIcon={processingUpdate ? <CircularProgress size={20} /> : null}
          >
            {processingUpdate ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog
        open={paymentDetailsDialogOpen}
        onClose={() => setPaymentDetailsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CreditCardIcon color="primary" />
            <Typography variant="h6">Payment & Order Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingPaymentDetails ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress size={40} />
            </Box>
          ) : !selectedOrderDetails ? (
            <Alert severity="error">Failed to load payment details</Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Information
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: mode === "light" ? "#f8f8f8" : "#333" }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                    <Typography variant="body2" fontWeight={500}>#{selectedOrderDetails.orderId}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip
                      label={selectedOrderDetails.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(selectedOrderDetails.status) + '20',
                        color: getStatusColor(selectedOrderDetails.status),
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Created:</Typography>
                    <Typography variant="body2">{formatDate(selectedOrderDetails.createdAt)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Updated:</Typography>
                    <Typography variant="body2">{formatDate(selectedOrderDetails.updatedAt)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                    <Typography variant="body1" fontWeight={600}>₱{selectedOrderDetails.totalAmount?.toLocaleString()}</Typography>
                  </Box>
                </Paper>

                {selectedOrderDetails.customer && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                      Customer Information
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: mode === "light" ? "#f8f8f8" : "#333" }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">Name:</Typography>
                        <Typography variant="body2" fontWeight={500}>{selectedOrderDetails.customer.name}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                        <Typography variant="body2">{selectedOrderDetails.customer.email}</Typography>
                      </Box>
                    </Paper>
                  </>
                )}

                {selectedOrderDetails.shippingAddress && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                      Shipping Address
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: mode === "light" ? "#f8f8f8" : "#333" }}>
                      <Typography variant="body2">{selectedOrderDetails.shippingAddress.streetAddress}</Typography>
                      <Typography variant="body2">
                        {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} {selectedOrderDetails.shippingAddress.postalCode}
                      </Typography>
                      <Typography variant="body2">{selectedOrderDetails.shippingAddress.country}</Typography>
                    </Paper>
                  </>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Payment Information
                </Typography>
                {selectedOrderDetails.payment ? (
                  <Paper elevation={1} sx={{ 
                      p: 2, 
                      bgcolor: mode === "light" ? "#f8f8f8" : "#333",
                      borderLeft: `4px solid ${
                        selectedOrderDetails.payment.status === "PAID" || selectedOrderDetails.payment.status === "COMPLETED" 
                          ? "#4CAF50" 
                          : "#FF9800"
                      }`
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Payment ID:</Typography>
                      <Typography variant="body2" fontWeight={500}>#{selectedOrderDetails.payment.paymentId}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={selectedOrderDetails.payment.status}
                        size="small"
                        sx={{
                          bgcolor: selectedOrderDetails.payment.status === "PAID" || selectedOrderDetails.payment.status === "COMPLETED"
                            ? "#4CAF5020"
                            : "#FF980020",
                          color: selectedOrderDetails.payment.status === "PAID" || selectedOrderDetails.payment.status === "COMPLETED"
                            ? "#4CAF50"
                            : "#FF9800",
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Amount:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedOrderDetails.payment.currency?.toUpperCase()} {selectedOrderDetails.payment.amount?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body2">{formatDate(selectedOrderDetails.payment.createdAt)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Method:</Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CreditCardIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">{selectedOrderDetails.payment.paymentMethod || "Credit Card"}</Typography>
                      </Box>
                    </Box>
                    {selectedOrderDetails.payment.stripeSessionId && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                        <Typography variant="body2" sx={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedOrderDetails.payment.stripeSessionId}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ) : (
                  <Paper elevation={1} sx={{ p: 2, bgcolor: mode === "light" ? "#f8f8f8" : "#333" }}>
                    <Typography color="error">No payment information available</Typography>
                  </Paper>
                )}

                {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                      Order Items
                    </Typography>
                    <Paper elevation={1} sx={{ bgcolor: mode === "light" ? "#f8f8f8" : "#333" }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Price</TableCell>
                              <TableCell align="right">Qty</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrderDetails.items.map((item) => (
                              <TableRow key={item.orderItemId}>
                                <TableCell>{item.product?.name || "Unknown Product"}</TableCell>
                                <TableCell align="right">₱{item.price?.toLocaleString()}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">₱{(item.price * item.quantity).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Total:</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>₱{selectedOrderDetails.totalAmount?.toLocaleString()}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({...notification, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({...notification, open: false})} 
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Order;
