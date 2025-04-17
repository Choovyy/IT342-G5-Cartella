import api from './api';

const addressService = {
  // Get addresses by user ID
  getAddressesByUserId: async (userId) => {
    try {
      const response = await api.get(`/addresses/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses by user ID:', error);
      throw error;
    }
  },

  // Get addresses by user email
  getAddressesByEmail: async (email) => {
    try {
      const response = await api.get(`/addresses/user/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses by email:', error);
      throw error;
    }
  },

  // Get addresses by username
  getAddressesByUsername: async (username) => {
    try {
      const response = await api.get(`/addresses/user/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses by username:', error);
      throw error;
    }
  },

  // Create address for user by ID
  createAddress: async (userId, addressData) => {
    try {
      const response = await api.post(`/addresses/user/${userId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // Create address for user by email
  createAddressByEmail: async (email, addressData) => {
    try {
      const response = await api.post(`/addresses/user/email/${email}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address by email:', error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.put(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
};

export default addressService; 