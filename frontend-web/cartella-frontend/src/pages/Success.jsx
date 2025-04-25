import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import axios from 'axios';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      try {
        setLoading(true);
        
        // Get user ID from session storage
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          throw new Error('User not found. Please log in again.');
        }

        // Check if user has an address
        try {
          const addressResponse = await axios.get(`http://localhost:8080/api/addresses/user/${userId}`);
          if (!addressResponse.data || addressResponse.data.length === 0) {
            throw new Error('No address found. Please add an address before completing your purchase.');
          }
        } catch (addressErr) {
          console.error('Error checking addresses:', addressErr);
          throw new Error('No address found. Please add an address before completing your purchase.');
        }

        // Create order
        await axios.post(`http://localhost:8080/api/orders/create/${userId}`);
        
        // Clear cart
        await axios.delete(`http://localhost:8080/api/cart/${userId}/clear`);
        
        setSuccess(true);
      } catch (err) {
        console.error('Error processing payment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, []);

  const handleViewPurchases = () => {
    navigate('/mypurchase');
  };

  const handleAddAddress = () => {
    navigate('/address');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6">Processing your payment...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: 600 }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
          {error.includes('address') ? (
            <Button variant="contained" color="primary" onClick={handleAddAddress}>
              Add Address
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={() => navigate('/cart')}>
              Return to Cart
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, maxWidth: 600 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ShoppingBagIcon />}
            onClick={handleViewPurchases}
            sx={{ mt: 2 }}
          >
            View My Purchases
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Success; 