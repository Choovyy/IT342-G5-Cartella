package cit.edu.cartella.service;

import cit.edu.cartella.entity.*;
import cit.edu.cartella.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;

    @Autowired
    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, 
                       AddressRepository addressRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.cartService = cartService;
    }

    public Order placeOrder(Long userId, Long addressId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> cartService.createCart(userId));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = cart.getCartItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order(cart.getUser(), address, totalAmount, OrderStatus.PENDING);
        orderRepository.save(order);

        return order;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserUserId(userId);
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return orderRepository.save(order);
    }
}
