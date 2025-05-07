package cit.edu.cartella.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    private LocalDateTime createdAt;
    
    @Transient
    private Map<String, String> additionalData;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public Notification() {
        this.additionalData = new HashMap<>();
    }

    public Notification(User user, String message) {
        this.user = user;
        this.message = message;
        this.isRead = false;
        this.additionalData = new HashMap<>();
    }

    // Getters and Setters
    public Long getNotificationId() {
        return notificationId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    // Additional data methods for enriched notifications
    public void setAdditionalData(String key, String value) {
        if (this.additionalData == null) {
            this.additionalData = new HashMap<>();
        }
        this.additionalData.put(key, value);
    }
    
    public String getAdditionalData(String key) {
        if (this.additionalData == null) {
            return null;
        }
        return this.additionalData.get(key);
    }
    
    public Map<String, String> getAllAdditionalData() {
        if (this.additionalData == null) {
            this.additionalData = new HashMap<>();
        }
        return this.additionalData;
    }
}
