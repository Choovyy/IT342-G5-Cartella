package cit.edu.cartella.dto;

import cit.edu.cartella.entity.CartItem;
import cit.edu.cartella.entity.Product;
import java.math.BigDecimal;

public class CartItemDTO {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String productDescription;
    private BigDecimal productPrice;
    private String productImageUrl;
    private int quantity;
    private BigDecimal subtotal;

    public CartItemDTO(CartItem cartItem) {
        this.cartItemId = cartItem.getCartItemId();
        Product product = cartItem.getProduct();
        this.productId = product.getProductId();
        this.productName = product.getName();
        this.productDescription = product.getDescription();
        this.productPrice = product.getPrice();
        this.productImageUrl = product.getImageUrl();
        this.quantity = cartItem.getQuantity();
        this.subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
    }

    // Getters and Setters
    public Long getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Long cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
} 