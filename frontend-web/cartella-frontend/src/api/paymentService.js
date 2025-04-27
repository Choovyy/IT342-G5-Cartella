import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const paymentService = {
  createPaymentIntent: async (paymentData, token) => {
    const response = await axios.post(
      `${API_URL}/payment/create-payment-intent`,
      paymentData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getPaymentsByUserId: async (userId, token) => {
    const response = await axios.get(
      `${API_URL}/payment/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getPaymentById: async (paymentId, token) => {
    const response = await axios.get(
      `${API_URL}/payment/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getPaymentBySessionId: async (sessionId, token) => {
    const response = await axios.get(
      `${API_URL}/payment/session/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  updatePaymentStatus: async (paymentId, status, token) => {
    const response = await axios.put(
      `${API_URL}/payment/${paymentId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },
  
  updatePaymentStatusBySessionId: async (sessionId, status, token) => {
    const response = await axios.put(
      `${API_URL}/payment/session/${sessionId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default paymentService;