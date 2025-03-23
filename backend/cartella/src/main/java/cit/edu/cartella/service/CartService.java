package cit.edu.cartella.service;

import cit.edu.cartella.entity.Cart;
import cit.edu.cartella.entity.CartItem;
import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.CartItemRepository;
import cit.edu.cartella.repository.CartRepository;
import cit.edu.cartella.repository.ProductRepository;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
        return cartRepository.findByUserUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
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
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = new CartItem(cart, product, quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new RuntimeException("CartItem not found");
        }
        cartItemRepository.deleteById(cartItemId);
    }
}
