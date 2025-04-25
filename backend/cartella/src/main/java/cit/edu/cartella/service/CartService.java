package cit.edu.cartella.service;

import cit.edu.cartella.entity.Cart;
import cit.edu.cartella.entity.CartItem;
import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.CartItemRepository;
import cit.edu.cartella.repository.CartRepository;
import cit.edu.cartella.repository.ProductRepository;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.dto.CartItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       UserRepository userRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserUserId(userId)
                .orElseGet(() -> createCart(userId));
    }

    public Cart createCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (cartRepository.findByUserUserId(userId).isPresent()) {
            throw new RuntimeException("User already has a cart");
        }

        Cart cart = new Cart(user, null, null);
        return cartRepository.save(cart);
    }

    public CartItem addProductToCart(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> createCart(userId));
                
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if product is in stock
        if (product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product is out of stock");
        }
        
        // Check if requested quantity is available
        if (quantity > product.getStockQuantity()) {
            throw new RuntimeException("Only " + product.getStockQuantity() + " items available in stock");
        }
        
        // Check if product is already in cart
        List<CartItem> existingItems = cartItemRepository.findByCartCartId(cart.getCartId());
        for (CartItem item : existingItems) {
            if (item.getProduct().getProductId().equals(productId)) {
                // Product already in cart, update quantity
                int newQuantity = item.getQuantity() + quantity;
                
                // Check if new total quantity exceeds stock
                if (newQuantity > product.getStockQuantity()) {
                    throw new RuntimeException("Cannot add more items. Only " + 
                        (product.getStockQuantity() - item.getQuantity()) + 
                        " more available in stock");
                }
                
                item.setQuantity(newQuantity);
                return cartItemRepository.save(item);
            }
        }

        // Product not in cart, create new cart item
        CartItem cartItem = new CartItem(cart, product, quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new RuntimeException("CartItem not found");
        }
        cartItemRepository.deleteById(cartItemId);
    }
    
    public CartItem updateCartItemQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
        
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        
        // Check if product has enough stock
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Only " + product.getStockQuantity() + " items available in stock");
        }
        
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        for (CartItem item : cartItems) {
            cartItemRepository.delete(item);
        }
    }

    public List<CartItem> getCartItemsByUserId(Long userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> createCart(userId));
        return cartItemRepository.findByCartCartId(cart.getCartId());
    }
    
    public List<CartItemDTO> getCartItemDTOsByUserId(Long userId) {
        List<CartItem> cartItems = getCartItemsByUserId(userId);
        return cartItems.stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList());
    }
}
