package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Order;
import cit.edu.cartella.entity.OrderItem;
import cit.edu.cartella.entity.Payment;
import cit.edu.cartella.entity.Address;
import cit.edu.cartella.entity.Product;
import cit.edu.cartella.service.OrderService;
import cit.edu.cartella.service.PaymentService;
import cit.edu.cartella.service.AddressService;
import cit.edu.cartella.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final AddressService addressService;
    private final ProductService productService;

    @Autowired
    public OrderController(OrderService orderService, PaymentService paymentService, 
                         AddressService addressService, ProductService productService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.addressService = addressService;
        this.productService = productService;
    }

    @PostMapping("/{userId}/{addressId}")
    public ResponseEntity<Order> placeOrder(@PathVariable Long userId, @PathVariable Long addressId) {
        return ResponseEntity.ok(orderService.placeOrder(userId, addressId));
    }

    @PostMapping("/create/{userId}")
    public ResponseEntity<Order> createOrderFromCart(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.createOrderFromCart(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        
        // Enhance each order with full address and product details
        orders.forEach(order -> {
            // Ensure address object exists
            if (order.getAddress() != null) {
                // Re-fetch address to get complete details
                Optional<Address> fullAddress = addressService.getAddressById(order.getAddress().getAddressId());
                fullAddress.ifPresent(order::setAddress);
            }
            
            // Ensure order items have complete product information
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item -> {
                    if (item.getProduct() != null) {
                        // Re-fetch product to get complete details
                        Optional<Product> fullProduct = productService.getProductById(item.getProduct().getProductId());
                        fullProduct.ifPresent(item::setProduct);
                    }
                });
            }
        });
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}/details")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            boolean cancelled = orderService.cancelOrder(orderId);
            if (cancelled) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order cancelled successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Unable to cancel order"
                ));
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", ex.getMessage()
            ));
        }
    }
    
    @GetMapping("/{orderId}/with-payment")
    public ResponseEntity<Map<String, Object>> getOrderWithPaymentDetails(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        Map<String, Object> response = new HashMap<>();
        
        // Add order details
        response.put("orderId", order.getOrderId());
        response.put("status", order.getStatus());
        response.put("createdAt", order.getCreatedAt());
        response.put("updatedAt", order.getUpdatedAt());
        response.put("totalAmount", order.getTotalAmount());
        
        // Add customer details
        if (order.getUser() != null) {
            Map<String, Object> customerDetails = new HashMap<>();
            customerDetails.put("userId", order.getUser().getUserId());
            customerDetails.put("name", order.getUser().getUsername());
            customerDetails.put("email", order.getUser().getEmail());
            response.put("customer", customerDetails);
        }
        
        // Add shipping address
        if (order.getAddress() != null) {
            Map<String, Object> addressDetails = new HashMap<>();
            addressDetails.put("streetAddress", order.getAddress().getStreetAddress());
            addressDetails.put("city", order.getAddress().getCity());
            addressDetails.put("state", order.getAddress().getState());
            addressDetails.put("postalCode", order.getAddress().getPostalCode());
            addressDetails.put("country", order.getAddress().getCountry());
            response.put("shippingAddress", addressDetails);
        }
        
        // Add order items
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<Map<String, Object>> items = order.getOrderItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("orderItemId", item.getOrderItemId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPriceAtTimeOfOrder());
                    
                    if (item.getProduct() != null) {
                        Map<String, Object> productMap = new HashMap<>();
                        productMap.put("productId", item.getProduct().getProductId());
                        productMap.put("name", item.getProduct().getName());
                        productMap.put("description", item.getProduct().getDescription());
                        productMap.put("imageUrl", item.getProduct().getImageUrl());
                        itemMap.put("product", productMap);
                    }
                    
                    return itemMap;
                })
                .toList();
            
            response.put("items", items);
        }
        
        // Add payment details
        Payment payment = paymentService.findPaymentByOrderId(orderId);
        if (payment != null) {
            Map<String, Object> paymentDetails = new HashMap<>();
            paymentDetails.put("paymentId", payment.getPaymentId());
            paymentDetails.put("status", payment.getStatus());
            paymentDetails.put("amount", payment.getAmount());
            paymentDetails.put("currency", payment.getCurrency());
            paymentDetails.put("createdAt", payment.getCreatedAt());
            paymentDetails.put("stripeSessionId", payment.getStripeSessionId());
            paymentDetails.put("paymentMethod", "Credit Card"); // Default payment method
            
            response.put("payment", paymentDetails);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Map<String, Object>>> getVendorOrders(@PathVariable Long vendorId) {
        List<Order> vendorOrders = orderService.getOrdersByVendorId(vendorId);
        List<Map<String, Object>> formattedOrders = new ArrayList<>();
        
        for (Order order : vendorOrders) {
            Map<String, Object> orderMap = new HashMap<>();
            
            // Add basic order details
            orderMap.put("orderId", order.getOrderId());
            orderMap.put("status", order.getStatus());
            orderMap.put("createdAt", order.getCreatedAt());
            orderMap.put("updatedAt", order.getUpdatedAt());
            orderMap.put("totalAmount", order.getTotalAmount());
            
            // Add shipping information
            if (order.getAddress() != null) {
                Map<String, Object> addressMap = new HashMap<>();
                addressMap.put("streetAddress", order.getAddress().getStreetAddress());
                addressMap.put("city", order.getAddress().getCity());
                addressMap.put("state", order.getAddress().getState());
                addressMap.put("postalCode", order.getAddress().getPostalCode());
                addressMap.put("country", order.getAddress().getCountry());
                orderMap.put("address", addressMap);
                
                // Also add a formatted version for backward compatibility
                orderMap.put("shippingAddress", order.getAddress().getStreetAddress() + ", " + 
                                          order.getAddress().getCity() + ", " + 
                                          order.getAddress().getState() + " " + 
                                          order.getAddress().getPostalCode());
            }
            
            // Add customer details
            if (order.getUser() != null) {
                Map<String, Object> customerMap = new HashMap<>();
                customerMap.put("name", order.getUser().getUsername());
                customerMap.put("email", order.getUser().getEmail());
                orderMap.put("customer", customerMap);
            }
            
            // Find vendor's product in this order
            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null && 
                        item.getProduct().getVendor() != null &&
                        item.getProduct().getVendor().getVendorId().equals(vendorId)) {
                        
                        // Add product details
                        orderMap.put("product", item.getProduct());
                        orderMap.put("quantity", item.getQuantity());
                        
                        // Break after finding the first product from this vendor
                        break;
                    }
                }
            }
            
            // Add payment info
            Payment payment = paymentService.findPaymentByOrderId(order.getOrderId());
            if (payment != null) {
                orderMap.put("paymentId", payment.getPaymentId());
                orderMap.put("paymentStatus", payment.getStatus());
            }
            
            formattedOrders.add(orderMap);
        }
        
        return ResponseEntity.ok(formattedOrders);
    }
    
    @GetMapping("/{orderId}/complete-details")
    public ResponseEntity<Map<String, Object>> getOrderCompleteDetails(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        Map<String, Object> response = new HashMap<>();
        
        // Add order details
        response.put("orderId", order.getOrderId());
        response.put("status", order.getStatus());
        response.put("createdAt", order.getCreatedAt());
        response.put("updatedAt", order.getUpdatedAt());
        response.put("totalAmount", order.getTotalAmount());
        
        // Add address details
        if (order.getAddress() != null) {
            Optional<Address> fullAddress = addressService.getAddressById(order.getAddress().getAddressId());
            if (fullAddress.isPresent()) {
                Map<String, Object> addressDetails = new HashMap<>();
                Address address = fullAddress.get();
                addressDetails.put("addressId", address.getAddressId());
                addressDetails.put("streetAddress", address.getStreetAddress());
                addressDetails.put("city", address.getCity());
                addressDetails.put("state", address.getState());
                addressDetails.put("postalCode", address.getPostalCode());
                addressDetails.put("country", address.getCountry());
                response.put("address", addressDetails);
            }
        }
        
        // Add order items with complete product details
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<Map<String, Object>> items = order.getOrderItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("orderItemId", item.getOrderItemId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("priceAtTimeOfOrder", item.getPriceAtTimeOfOrder());
                    
                    if (item.getProduct() != null) {
                        Optional<Product> fullProduct = productService.getProductById(item.getProduct().getProductId());
                        if (fullProduct.isPresent()) {
                            Product product = fullProduct.get();
                            Map<String, Object> productMap = new HashMap<>();
                            productMap.put("productId", product.getProductId());
                            productMap.put("name", product.getName());
                            productMap.put("description", product.getDescription());
                            productMap.put("imageUrl", product.getImageUrl());
                            productMap.put("currentPrice", product.getPrice());
                            if (product.getVendor() != null) {
                                productMap.put("vendorName", product.getVendor().getBusinessName());
                            }
                            itemMap.put("product", productMap);
                        }
                    }
                    
                    return itemMap;
                })
                .toList();
            
            response.put("orderItems", items);
        }
        
        // Add payment information
        Payment payment = paymentService.findPaymentByOrderId(orderId);
        if (payment != null) {
            Map<String, Object> paymentDetails = new HashMap<>();
            paymentDetails.put("paymentId", payment.getPaymentId());
            paymentDetails.put("status", payment.getStatus());
            paymentDetails.put("amount", payment.getAmount());
            paymentDetails.put("currency", payment.getCurrency());
            paymentDetails.put("createdAt", payment.getCreatedAt());
            paymentDetails.put("stripeSessionId", payment.getStripeSessionId());
            paymentDetails.put("paymentMethod", payment.getPaymentMethod());
            response.put("payment", paymentDetails);
        }
        
        return ResponseEntity.ok(response);
    }
}
