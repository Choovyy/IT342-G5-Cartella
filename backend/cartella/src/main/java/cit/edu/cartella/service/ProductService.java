package cit.edu.cartella.service;

import cit.edu.cartella.dto.ProductDTO;
import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.Vendor;
import cit.edu.cartella.repository.ProductRepository;
import cit.edu.cartella.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    // Add a product
    public Product addProduct(Long vendorId, Product productDetails) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        productDetails.setVendor(vendor);
        return productRepository.save(productDetails);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get product by ID
    public Optional<Product> getProductById(Long productId) {
        return productRepository.findById(productId);
    }

    // Get products by vendor
    public List<ProductDTO> getProductsByVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        return productRepository.findByVendor(vendor).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        return new ProductDTO(
            product.getProductId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStockQuantity(),
            product.getCategory(),
            product.getImageUrl(),
            product.getVendor().getBusinessName(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }

    // Get products by category
    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get products by vendor and category
    public List<ProductDTO> getProductsByVendorAndCategory(Long vendorId, String category) {
        return productRepository.findByVendorVendorIdAndCategoryIgnoreCase(vendorId, category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Update product
    public Optional<Product> updateProduct(Long productId, Product productDetails) {
        return productRepository.findById(productId).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setCategory(productDetails.getCategory());
            if (productDetails.getImageUrl() != null) {
                product.setImageUrl(productDetails.getImageUrl());
            }
            return productRepository.save(product);
        });
    }

    // Delete product
    public boolean deleteProduct(Long productId) {
        if (productRepository.existsById(productId)) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }
}
