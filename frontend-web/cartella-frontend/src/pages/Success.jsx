import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import paymentService from '../api/paymentService';
import addressService from '../api/addressService';
import cartService from '../api/cartService';
import orderService from '../api/orderService';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        setLoading(true);
        
        // Get user ID from session storage
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('authToken');
        
        if (!userId) {
          throw new Error('User not found. Please log in again.');
        }
        
        // Get query parameters - session_id should be passed from Stripe
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');

        // For debugging - log what's in the URL
        console.log("URL search params:", location.search);
        console.log("Session ID from URL:", sessionId);

        // Handle case where session_id is missing
        if (!sessionId) {
          console.log("No session_id in URL, checking if payment was already processed");
          
          // Continue to order creation even without session ID
          // This will help in cases where the payment was successful but redirect parameters were lost
          try {
            // Check if user has an address
            const addresses = await addressService.getAddressesByUserId(userId);
            if (!addresses || addresses.length === 0) {
              throw new Error('No address found. Please add an address before completing your purchase.');
            }
            
            // Create order
            const orderResponse = await orderService.createOrder({ userId });
            setOrderDetails(orderResponse);
            
            // Clear cart
            await cartService.clearCart(userId);
            
            setSuccess(true);
          } catch (fallbackErr) {
            console.error('Error in fallback flow:', fallbackErr);
            throw new Error('Unable to complete your order. You can check your orders in the purchase history or try again.');
          }
        } else {
          // Normal flow with session ID
          try {
            // Get payment details
            const payment = await paymentService.getPaymentBySessionId(sessionId, token);
            console.log("Retrieved payment details:", payment);
            
            // Update payment status to PENDING instead of COMPLETED
            // This allows the vendor to review and accept the order first
            await paymentService.updatePaymentStatusBySessionId(sessionId, 'PENDING', token);
            
            // Check if user has an address
            const addresses = await addressService.getAddressesByUserId(userId);
            if (!addresses || addresses.length === 0) {
              throw new Error('No address found. Please add an address before completing your purchase.');
            }
            
            // Create order
            const orderResponse = await orderService.createOrder({ userId });
            setOrderDetails(orderResponse);
            
            // Clear cart
            await cartService.clearCart(userId);
            
            setSuccess(true);
          } catch (paymentErr) {
            console.error('Error with payment handling:', paymentErr);
            
            // Try to create the order even if payment update fails
            try {
              const addresses = await addressService.getAddressesByUserId(userId);
              if (!addresses || addresses.length === 0) {
                throw new Error('No address found. Please add an address before completing your purchase.');
              }
              
              const orderResponse = await orderService.createOrder({ userId });
              setOrderDetails(orderResponse);
              
              await cartService.clearCart(userId);
              
              setSuccess(true);
            } catch (orderErr) {
              console.error('Error creating order after payment:', orderErr);
              throw new Error('Your payment may have been processed, but we had trouble creating your order. Please check your purchase history.');
            }
          }
        }
      } catch (err) {
        console.error('Error processing payment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [location.search]);

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
          {orderDetails && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2">
                Order ID: #{orderDetails.orderId}
              </Typography>
              <Typography variant="body2">
                Total Amount: ₱{orderDetails.totalAmount.toLocaleString()}
              </Typography>
            </Alert>
          )}
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