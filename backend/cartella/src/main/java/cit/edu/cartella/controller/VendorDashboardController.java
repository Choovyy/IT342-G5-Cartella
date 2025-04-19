package cit.edu.cartella.controller;

import cit.edu.cartella.entity.*;
import cit.edu.cartella.repository.*;
import cit.edu.cartella.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendor-dashboard")
public class VendorDashboardController {

    private final VendorService vendorService;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    

    @Autowired
    public VendorDashboardController(
            VendorService vendorService,
            VendorRepository vendorRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository
    ) {
        this.vendorService = vendorService;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/{vendorId}/summary")
    public ResponseEntity<?> getVendorDashboardSummary(@PathVariable Long vendorId) {
        try {
            // Get vendor details
            Optional<Vendor> vendorOpt = vendorRepository.findById(vendorId);
            if (vendorOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Vendor vendor = vendorOpt.get();

            // Get all products for this vendor
            List<Product> products = productRepository.findByVendorVendorId(vendorId);
            
            // Get all order items for this vendor's products
            List<OrderItem> orderItems = orderItemRepository.findByProductVendorVendorId(vendorId);
            
            // Get all orders containing this vendor's products
            Set<Order> orders = orderItems.stream()
                    .map(OrderItem::getOrder)
                    .collect(Collectors.toSet());
            
            // Calculate total revenue
            BigDecimal totalRevenue = orderItems.stream()
                    .map(item -> item.getPriceAtTimeOfOrder().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate total products
            int totalProducts = products.size();
            
            // Calculate total orders
            int totalOrders = orders.size();
            
            // Calculate total sold items
            int totalSoldItems = orderItems.stream()
                    .mapToInt(OrderItem::getQuantity)
                    .sum();
            
            // Get business name and joined date
            String businessName = vendor.getBusinessName();
            String joinedDate = vendor.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("businessName", businessName);
            response.put("joinedDate", joinedDate);
            response.put("totalProducts", totalProducts);
            response.put("totalOrders", totalOrders);
            response.put("totalRevenue", totalRevenue);
            response.put("totalSoldItems", totalSoldItems);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An error occurred while fetching dashboard data"));
        }
    }

    @GetMapping("/{vendorId}/chart-data")
    public ResponseEntity<?> getVendorChartData(@PathVariable Long vendorId) {
        try {
            // Get all products for this vendor
            List<Product> products = productRepository.findByVendorVendorId(vendorId);
            
            // Get all order items for this vendor's products
            List<OrderItem> orderItems = orderItemRepository.findByProductVendorVendorId(vendorId);
            
            // Get all orders containing this vendor's products
            Set<Order> orders = orderItems.stream()
                    .map(OrderItem::getOrder)
                    .collect(Collectors.toSet());
            
            // Group orders by month
            Map<String, List<Order>> ordersByMonth = orders.stream()
                    .collect(Collectors.groupingBy(order -> 
                        order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"))));
            
            // Group products by month
            Map<String, List<Product>> productsByMonth = products.stream()
                    .collect(Collectors.groupingBy(product -> 
                        product.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"))));
            
            // Group order items by month
            Map<String, List<OrderItem>> orderItemsByMonth = orderItems.stream()
                    .collect(Collectors.groupingBy(item -> 
                        item.getOrder().getCreatedAt().format(DateTimeFormatter.ofPattern("MMM"))));
            
            // Get the last 4 months
            List<String> last4Months = getLast4Months();
            
            // Prepare chart data
            List<Integer> ordersData = new ArrayList<>();
            List<Integer> productsData = new ArrayList<>();
            List<BigDecimal> revenueData = new ArrayList<>();
            
            for (String month : last4Months) {
                // Orders count
                ordersData.add(ordersByMonth.getOrDefault(month, Collections.emptyList()).size());
                
                // Products count
                productsData.add(productsByMonth.getOrDefault(month, Collections.emptyList()).size());
                
                // Revenue
                BigDecimal monthRevenue = orderItemsByMonth.getOrDefault(month, Collections.emptyList()).stream()
                        .map(item -> item.getPriceAtTimeOfOrder().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                revenueData.add(monthRevenue);
            }
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("labels", last4Months);
            response.put("orders", ordersData);
            response.put("products", productsData);
            response.put("revenue", revenueData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An error occurred while fetching chart data"));
        }
    }
    
    private List<String> getLast4Months() {
        List<String> months = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 3; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            months.add(month.format(formatter));
        }
        
        return months;
    }
} 