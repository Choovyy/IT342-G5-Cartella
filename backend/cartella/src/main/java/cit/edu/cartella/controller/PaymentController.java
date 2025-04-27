package cit.edu.cartella.controller;

import cit.edu.cartella.dto.PaymentIntentDTO;
import cit.edu.cartella.entity.Payment;
import cit.edu.cartella.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<PaymentIntentDTO> createPaymentIntent(@RequestBody PaymentIntentDTO paymentIntentDTO) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(paymentIntentDTO));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long paymentId) {
        return paymentService.getPaymentById(paymentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Payment> getPaymentBySessionId(@PathVariable String sessionId) {
        return paymentService.getPaymentBySessionId(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(paymentService.updatePaymentStatus(paymentId, status));
    }
    
    @PutMapping("/session/{sessionId}/status")
    public ResponseEntity<Payment> updatePaymentStatusBySessionId(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(paymentService.updatePaymentStatusBySessionId(sessionId, status));
    }
}