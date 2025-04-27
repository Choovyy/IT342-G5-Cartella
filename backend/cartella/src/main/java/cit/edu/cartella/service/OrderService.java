package cit.edu.cartella.service;

import cit.edu.cartella.entity.*;
import cit.edu.cartella.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;

    @Autowired
    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, 
                       AddressRepository addressRepository, CartService cartService,
                       OrderItemRepository orderItemRepository, ProductRepository productRepository,
                       PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentService = paymentService;
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

        // Log the selected address details for troubleshooting
        System.out.println("Using address ID: " + address.getAddressId() + " for placeOrder");
        System.out.println("Address street: " + address.getStreetAddress());
        
        Order order = new Order(cart.getUser(), address, totalAmount, OrderStatus.PENDING);
        order = orderRepository.save(order);
        
        // Refresh the order to ensure all relationships are loaded
        return orderRepository.findById(order.getOrderId()).orElse(order);
    }

    @Transactional
    public Order createOrderFromCart(Long userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Get the user's addresses
        List<Address> addresses = addressRepository.findByUserUserId(userId);
        if (addresses.isEmpty()) {
            throw new RuntimeException("No address found for user");
        }

        // Find the default address
        Address address = addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No default address found. Please set a default address before checkout."));

        // Log the selected address details for troubleshooting
        System.out.println("Using address ID: " + address.getAddressId());
        System.out.println("Address street: " + address.getStreetAddress());
        System.out.println("Address city: " + address.getCity());
        
        // Make sure we're using a fully loaded address from the database
        address = addressRepository.findById(address.getAddressId()).orElse(address);

        BigDecimal totalAmount = cart.getCartItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order(cart.getUser(), address, totalAmount, OrderStatus.PENDING);
        order = orderRepository.save(order);
        
        // Create order items from cart items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            
            // Check if enough stock
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " is out of stock. Only " + 
                                          product.getStockQuantity() + " remaining.");
            }
            
            // Create OrderItem
            OrderItem orderItem = new OrderItem(
                order, 
                product, 
                cartItem.getQuantity(), 
                product.getPrice()
            );
            orderItems.add(orderItem);
            orderItemRepository.save(orderItem);
            
            // Decrease stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setOrderItems(orderItems);
        
        // Explicitly set the address again to ensure the relationship is maintained
        order.setAddress(address);
        
        order = orderRepository.save(order);
        
        // Clear the user's cart after successful order
        cartService.clearCart(userId);
        
        // Refresh the order to ensure all relationships are loaded
        return orderRepository.findById(order.getOrderId()).orElse(order);
    }

    public List<Order> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserUserId(userId);
        
        // For each order, ensure relationships are fully loaded
        for (Order order : orders) {
            // Explicitly fetch complete order information
            if (order.getOrderId() != null) {
                Optional<Order> fullOrder = orderRepository.findById(order.getOrderId());
                if (fullOrder.isPresent()) {
                    // Ensure address information is loaded
                    if (fullOrder.get().getAddress() != null) {
                        order.setAddress(fullOrder.get().getAddress());
                        
                        // Log for debugging
                        System.out.println("Address loaded for order " + order.getOrderId() + 
                                         ": " + order.getAddress().getCity() + ", " + 
                                         order.getAddress().getCountry());
                    } else {
                        System.out.println("No address found for order " + order.getOrderId());
                    }
                    
                    // Ensure order items with product details are loaded
                    if (fullOrder.get().getOrderItems() != null) {
                        // Set the order items on the returned order
                        order.setOrderItems(fullOrder.get().getOrderItems());
                        
                        for (OrderItem item : order.getOrderItems()) {
                            // Ensure each product's information is fully loaded
                            if (item.getProduct() != null) {
                                // Force loading of the product by accessing its properties
                                Product product = item.getProduct();
                                System.out.println("Product loaded for item in order " + order.getOrderId() + 
                                                 ": " + product.getName() + " with description: " + 
                                                 (product.getDescription() != null ? product.getDescription().substring(0, Math.min(30, product.getDescription().length())) + "..." : "No description"));
                            } else {
                                System.out.println("No product found for item in order " + order.getOrderId());
                                
                                // This item is missing a product reference, try to recover by fetching 
                                // the product directly using the order item's product ID field if available
                                if (orderItemRepository != null) {
                                    try {
                                        OrderItem fullItem = orderItemRepository.findById(item.getOrderItemId()).orElse(null);
                                        if (fullItem != null && fullItem.getProduct() != null) {
                                            // We found the product via the repository
                                            item.setProduct(fullItem.getProduct());
                                            System.out.println("Product manually loaded for item in order " + order.getOrderId());
                                        }
                                    } catch (Exception e) {
                                        System.out.println("Error trying to load product for order item: " + e.getMessage());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return orders;
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        
        // If the order is being marked as DELIVERED, update the associated payment status to COMPLETED
        if (newStatus == OrderStatus.DELIVERED) {
            // Find and update associated payment
            Payment payment = paymentService.findPaymentByOrderId(orderId);
            if (payment != null) {
                System.out.println("Order " + orderId + " is delivered, updating payment " + payment.getPaymentId() + " to COMPLETED");
                paymentService.updatePaymentStatus(payment.getPaymentId(), "COMPLETED");
            } else {
                System.out.println("No payment found for delivered order " + orderId);
            }
        }
        
        return orderRepository.save(order);
    }
    
    @Transactional
    public boolean cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        // Only allow cancellation if order is still PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Cannot cancel order that is already " + order.getStatus());
        }
        
        // Return the stock quantities
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        
        // Update order status to CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Update the associated payment status to CANCELLED as well
        Payment payment = paymentService.findPaymentByOrderId(orderId);
        if (payment != null) {
            System.out.println("Order " + orderId + " is cancelled, updating payment " + payment.getPaymentId() + " to CANCELLED");
            paymentService.updatePaymentStatus(payment.getPaymentId(), "CANCELLED");
        } else {
            System.out.println("No payment found for cancelled order " + orderId);
        }
        
        return true;
    }

    public List<Order> getOrdersByVendorId(Long vendorId) {
        List<Order> vendorOrders = new ArrayList<>();
        
        // Find all orders where any order item contains a product from this vendor
        List<Order> allOrders = orderRepository.findAll();
        
        for (Order order : allOrders) {
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null && 
                        item.getProduct().getVendor() != null &&
                        item.getProduct().getVendor().getVendorId().equals(vendorId)) {
                        vendorOrders.add(order);
                        break; // Break once we find one product from this vendor in the order
                    }
                }
            }
        }
        
        return vendorOrders;
    }
}
