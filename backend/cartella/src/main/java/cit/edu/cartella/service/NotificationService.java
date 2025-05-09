package cit.edu.cartella.service;

import cit.edu.cartella.entity.Notification;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.NotificationRepository;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(Long userId, String message) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            Notification notification = new Notification(userOptional.get(), message);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("User not found");
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserUserId(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
        if (notificationOptional.isPresent()) {
            Notification notification = notificationOptional.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found");
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void addPaymentNotification(Long userId, String paymentDetails) {
        String message = "Payment successful: " + paymentDetails;
        createNotification(userId, message);
    }

    public Notification addOrderStatusNotification(Long userId, String orderStatus, String orderDetails) {
        String message = "Order " + orderStatus + ": " + orderDetails;
        return createNotification(userId, message);
    }
    
    public Notification createTrackingNotification(Long userId, String message, String orderId, 
                                                   String trackingDetails, String estimatedDelivery) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        // Create a basic notification with the message
        Notification notification = new Notification(userOptional.get(), message);
        
        // Store additional data in the notification object
        // Note: In a real implementation, you might want to add these fields to your Notification entity
        // For now, we'll just set them as transient data that will be included in the JSON response
        notification.setAdditionalData("orderId", orderId);
        notification.setAdditionalData("trackingDetails", trackingDetails);
        notification.setAdditionalData("estimatedDelivery", estimatedDelivery);
        
        return notificationRepository.save(notification);
    }
}
