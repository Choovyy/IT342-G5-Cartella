import api from './api';

const vendorService = {
  // Get vendor profile by ID
  getVendorById: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  },

  // Get vendor dashboard summary
  getVendorDashboardSummary: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/dashboard/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor dashboard summary:', error);
      throw error;
    }
  },

  // Get vendor dashboard chart data
  getVendorDashboardChartData: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/dashboard/charts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor dashboard chart data:', error);
      throw error;
    }
  },

  // Get vendor products
  getVendorProducts: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  },

  // Get vendor orders
  getVendorOrders: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  },

  // Update vendor profile
  updateVendorProfile: async (vendorId, vendorData) => {
    try {
      const response = await api.put(`/vendors/${vendorId}`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  },

  // Get vendor statistics
  getVendorStatistics: async (vendorId, period = 'monthly') => {
    try {
      const response = await api.get(`/vendors/${vendorId}/statistics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor statistics:', error);
      throw error;
    }
  }
};

export default vendorService;