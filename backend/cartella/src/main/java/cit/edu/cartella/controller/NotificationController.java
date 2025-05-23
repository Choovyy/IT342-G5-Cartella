package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Notification;
import cit.edu.cartella.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Notification> createNotification(@PathVariable Long userId, @RequestBody String message) {
        Notification notification = notificationService.createNotification(userId, message);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/payment")
    public ResponseEntity<Notification> addPaymentNotification(
            @PathVariable Long userId,
            @RequestBody String paymentDetails) {
        notificationService.addPaymentNotification(userId, paymentDetails);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/order-status")
    public ResponseEntity<Notification> addOrderStatusNotification(
            @PathVariable Long userId,
            @RequestParam String status,
            @RequestBody String orderDetails) {
        Notification notification = notificationService.addOrderStatusNotification(userId, status, orderDetails);
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/{userId}/order-tracking")
    public ResponseEntity<Notification> addOrderTrackingNotification(
            @PathVariable Long userId,
            @RequestParam String orderId,
            @RequestParam String estimatedDelivery,
            @RequestBody String trackingDetails) {

        // Create a tracking notification that includes shipping details
        String message = String.format("Your order #%s has been SHIPPED. %s", orderId, trackingDetails);
        Notification notification = notificationService.createTrackingNotification(
                userId,
                message,
                orderId,
                trackingDetails,
                estimatedDelivery
        );

        return ResponseEntity.ok(notification);
    }
}
