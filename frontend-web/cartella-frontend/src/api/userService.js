import api from './api';

const userService = {
  // Get user profile by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get user profile by username
  getUserByUsername: async (username) => {
    try {
      const response = await api.get(`/users/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  },

  // Get user profile by email
  getUserByEmail: async (email) => {
    try {
      const response = await api.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      // Get username from session storage
      const username = sessionStorage.getItem('username');
      if (!username) {
        throw new Error('Username not found');
      }
      const response = await api.get(`/users/username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update user profile by ID
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user profile by username
  updateUserByUsername: async (username, userData) => {
    try {
      console.log('Updating user by username:', username, userData);
      const response = await api.put(`/users/username/${username}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user by username:', error);
      throw error;
    }
  },

  // Update user profile by email
  updateUserByEmail: async (email, userData) => {
    try {
      console.log('Updating user by email:', email, userData);
      const response = await api.put(`/users/email/${email}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user by email:', error);
      throw error;
    }
  }
};

export default userService; 