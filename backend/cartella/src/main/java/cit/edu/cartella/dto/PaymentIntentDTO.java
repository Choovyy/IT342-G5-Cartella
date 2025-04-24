package cit.edu.cartella.dto;

import lombok.Data;

@Data
public class PaymentIntentDTO {
    private Long amount;
    private String currency;
    private String userId;
    private String clientSecret;
} 