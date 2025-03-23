package cit.edu.cartella.service;

import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.Vendor;
import cit.edu.cartella.repository.ProductRepository;
import cit.edu.cartella.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
    }

    public Product createProduct(Long vendorId, Product productDetails) {
        Optional<Vendor> vendorOptional = vendorRepository.findById(vendorId);

        if (vendorOptional.isEmpty()) {
            throw new RuntimeException("Vendor not found");
        }

        Vendor vendor = vendorOptional.get();
        Product product = new Product(vendor, productDetails.getName(), productDetails.getDescription(),
                productDetails.getPrice(), productDetails.getStockQuantity(), productDetails.getCategory());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long productId) {
        return productRepository.findById(productId);
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        Optional<Vendor> vendorOptional = vendorRepository.findById(vendorId);
        if (vendorOptional.isEmpty()) {
            throw new RuntimeException("Vendor not found");
        }
        return productRepository.findByVendor(vendorOptional.get());
    }

    public Product updateProduct(Long productId, Product productDetails) {
        return productRepository.findById(productId).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setCategory(productDetails.getCategory());
            product.setUpdatedAt(LocalDateTime.now());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }
}
