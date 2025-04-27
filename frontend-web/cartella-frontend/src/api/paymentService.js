import api from './api';

const paymentService = {
  createPaymentIntent: async (paymentData, token) => {
    try {
      const response = await api.post(
        `/payment/create-payment-intent`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  getPaymentsByUserId: async (userId, token) => {
    try {
      const response = await api.get(
        `/payment/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payments by user ID:', error);
      throw error;
    }
  },

  getPaymentById: async (paymentId, token) => {
    try {
      const response = await api.get(
        `/payment/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      throw error;
    }
  },

  getPaymentBySessionId: async (sessionId, token) => {
    try {
      const response = await api.get(
        `/payment/session/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment by session ID:', error);
      throw error;
    }
  },

  updatePaymentStatus: async (paymentId, status, token) => {
    try {
      const response = await api.put(
        `/payment/${paymentId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
  
  updatePaymentStatusBySessionId: async (sessionId, status, token) => {
    try {
      const response = await api.put(
        `/payment/session/${sessionId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment status by session ID:', error);
      throw error;
    }
  }
};

export default paymentService;