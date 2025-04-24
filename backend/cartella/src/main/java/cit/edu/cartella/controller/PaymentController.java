package cit.edu.cartella.controller;

import cit.edu.cartella.dto.PaymentIntentDTO;
import cit.edu.cartella.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
} 