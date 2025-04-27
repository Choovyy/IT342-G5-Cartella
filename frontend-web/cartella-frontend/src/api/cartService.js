import api from './api';

const cartService = {
  // Get cart items with product details
  getCartItemsDto: async (userId) => {
    try {
      const response = await api.get(`/cart/items-dto/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeCartItem: async (cartItemId) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  // Update item quantity
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${cartItemId}?quantity=${quantity}`, {});
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (userId, productId, quantity) => {
    try {
      const response = await api.post(`/cart/add`, {
        userId: userId,
        productId: productId,
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },
  
  // Create a new cart for a user
  createCart: async (userId) => {
    try {
      const response = await api.post(`/cart/create/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },
  
  // Clear all items from cart
  clearCart: async (userId) => {
    try {
      const response = await api.delete(`/cart/${userId}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default cartService;