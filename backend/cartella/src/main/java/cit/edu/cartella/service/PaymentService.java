package cit.edu.cartella.service;

import cit.edu.cartella.dto.PaymentIntentDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    @PostConstruct
    public void init() {
        Stripe.apiKey = "sk_test_51RH2ZDCoSzNJio8V9KcG34RedZ7LWZkB0cBmXweGSxp4DHQL6DUevT8t2cqv0bWG7edgwUbVGZ52ie0F3BKRgeAh00cXlWCQbF";
    }

    public PaymentIntentDTO createPaymentIntent(PaymentIntentDTO paymentIntentDTO) {
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/payment-success")
                .setCancelUrl("http://localhost:5173/cart")
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(paymentIntentDTO.getCurrency())
                                .setUnitAmount(paymentIntentDTO.getAmount())
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
            
            PaymentIntentDTO response = new PaymentIntentDTO();
            response.setClientSecret(session.getId());
            return response;
            
        } catch (StripeException e) {
            throw new RuntimeException("Error creating checkout session", e);
        }
    }
} 