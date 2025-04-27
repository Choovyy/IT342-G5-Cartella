import api from './api';

const authService = {
  // User authentication
  loginUser: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      // Store auth data in session storage
      sessionStorage.setItem('authToken', response.data.token);
      sessionStorage.setItem('username', credentials.username);
      sessionStorage.setItem('userId', response.data.userId);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Vendor authentication
  loginVendor: async (credentials) => {
    try {
      const response = await api.post('/vendors/login', credentials);
      // Store auth data in session storage
      sessionStorage.setItem('authToken', response.data.token);
      sessionStorage.setItem('username', credentials.username);
      sessionStorage.setItem('userId', response.data.userId);
      sessionStorage.setItem('vendorId', response.data.vendorId);
      sessionStorage.setItem('businessName', response.data.businessName);
      sessionStorage.setItem('joinedDate', response.data.joinedDate);
      
      return response.data;
    } catch (error) {
      console.error('Vendor login error:', error);
      throw error;
    }
  },

  // User registration
  registerUser: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Vendor registration
  registerVendor: async (vendorData) => {
    try {
      const response = await api.post('/vendors/register', vendorData);
      return response.data;
    } catch (error) {
      console.error('Vendor registration error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('vendorId');
    sessionStorage.removeItem('businessName');
    sessionStorage.removeItem('joinedDate');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!sessionStorage.getItem('authToken');
  },

  // Check if vendor is authenticated
  isVendorAuthenticated: () => {
    return !!sessionStorage.getItem('authToken') && !!sessionStorage.getItem('vendorId');
  },
  
  // Get current auth token
  getAuthToken: () => {
    return sessionStorage.getItem('authToken');
  }
};

export default authService;