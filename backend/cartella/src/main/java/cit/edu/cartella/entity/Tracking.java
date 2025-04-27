package cit.edu.cartella.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tracking")
public class Tracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trackingId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-tracking")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrackingStatus status;

    private LocalDateTime updatedAt;

    // Default Constructor
    public Tracking() {}

    // Parameterized Constructor
    public Tracking(Order order, TrackingStatus status, LocalDateTime updatedAt) {
        this.order = order;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(Long trackingId) {
        this.trackingId = trackingId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public TrackingStatus getStatus() {
        return status;
    }

    public void setStatus(TrackingStatus status) {
        this.status = status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
