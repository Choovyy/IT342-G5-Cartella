package cit.edu.cartella.service;

import cit.edu.cartella.dto.PaymentIntentDTO;
import cit.edu.cartella.entity.Payment;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.PaymentRepository;
import cit.edu.cartella.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = "sk_test_51RH2ZDCoSzNJio8V9KcG34RedZ7LWZkB0cBmXweGSxp4DHQL6DUevT8t2cqv0bWG7edgwUbVGZ52ie0F3BKRgeAh00cXlWCQbF";
    }

    @Transactional
    public PaymentIntentDTO createPaymentIntent(PaymentIntentDTO paymentIntentDTO) {
        try {
            // Parse user ID from the string
            Long userId = Long.parseLong(paymentIntentDTO.getUserId());
            
            // Get user from database
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Log the incoming amount for debugging
            System.out.println("Received amount in cents: " + paymentIntentDTO.getAmount());
            
            // Convert back to main currency units for display and storage
            BigDecimal amountInMainUnit = BigDecimal.valueOf(paymentIntentDTO.getAmount())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            System.out.println("Amount in main currency units: " + amountInMainUnit);
            
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/cart")
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(paymentIntentDTO.getCurrency())
                                .setUnitAmount(paymentIntentDTO.getAmount()) // Using cents for Stripe
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Cart Items")
                                        .build()
                                )
                                .build()
                        )
                        .setQuantity(1L)
                        .build()
                )
                .build();

            Session session = Session.create(params);
            
            // Create and save the payment record
            Payment payment = Payment.builder()
                    .amount(amountInMainUnit) // Store in main currency units (not cents)
                    .currency(paymentIntentDTO.getCurrency())
                    .stripeSessionId(session.getId())
                    .status("PENDING")
                    .user(user)
                    .build();
            
            paymentRepository.save(payment);
            
            // Return the payment intent DTO with client secret
            PaymentIntentDTO response = new PaymentIntentDTO();
            response.setClientSecret(session.getId());
            return response;
            
        } catch (StripeException e) {
            throw new RuntimeException("Error creating checkout session", e);
        }
    }
    
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserUserId(userId);
    }
    
    public Optional<Payment> getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId);
    }
    
    public Optional<Payment> getPaymentBySessionId(String sessionId) {
        return paymentRepository.findByStripeSessionId(sessionId);
    }
    
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }
    
    @Transactional
    public Payment updatePaymentStatusBySessionId(String sessionId, String status) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }
    
    /**
     * Find a payment by its associated order ID
     * 
     * @param orderId The ID of the order
     * @return The payment associated with the order, or null if not found
     */
    public Payment findPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderOrderId(orderId).orElse(null);
    }
}