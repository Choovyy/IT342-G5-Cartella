package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserUserId(Long userId);
    Optional<Payment> findByStripeSessionId(String sessionId);
    List<Payment> findByStatus(String status);
    Optional<Payment> findByOrderOrderId(Long orderId);
}