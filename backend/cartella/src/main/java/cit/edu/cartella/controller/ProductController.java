package cit.edu.cartella.controller;

import cit.edu.cartella.dto.ProductDTO;
import cit.edu.cartella.entity.Product;
import cit.edu.cartella.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;
    private final String uploadDir = "uploads/products/";

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
        // Create upload directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Get products by vendor and category
    @GetMapping("/vendor/{vendorId}/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByVendorAndCategory(
            @PathVariable Long vendorId,
            @PathVariable String category) {
        // Decode the category name from URL encoding
        String decodedCategory = UriUtils.decode(category, StandardCharsets.UTF_8);
        List<ProductDTO> products = productService.getProductsByVendorAndCategory(vendorId, decodedCategory);
        return ResponseEntity.ok(products);
    }

    // Get all product categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = List.of(
            "Men's Apparel",
            "Men's Accessories",
            "Women's Apparel",
            "Women's Accessories",
            "Mobiles & Gadgets",
            "Home Appliances",
            "Gaming"
        );
        return ResponseEntity.ok(categories);
    }

    // Add a new product with image
    @PostMapping(value = "/{vendorId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> addProductWithImage(
            @PathVariable Long vendorId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam("stockQuantity") String stockQuantity,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(new java.math.BigDecimal(price));
            product.setStockQuantity(Integer.parseInt(stockQuantity));
            product.setCategory(category);

            // Handle image upload if present
            if (image != null && !image.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, image.getBytes());
                product.setImageUrl("/api/products/images/" + fileName);
            }

            Product savedProduct = productService.addProduct(vendorId, product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get products by vendor
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<ProductDTO>> getProductsByVendor(@PathVariable Long vendorId) {
        List<ProductDTO> products = productService.getProductsByVendor(vendorId);
        return ResponseEntity.ok(products);
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable String category) {
        // Decode the category name from URL encoding
        String decodedCategory = UriUtils.decode(category, StandardCharsets.UTF_8);
        List<ProductDTO> products = productService.getProductsByCategory(decodedCategory);
        return ResponseEntity.ok(products);
    }

    // Update product with image
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProductWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam("stockQuantity") String stockQuantity,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(new java.math.BigDecimal(price));
            product.setStockQuantity(Integer.parseInt(stockQuantity));
            product.setCategory(category);

            // Handle image upload if present
            if (image != null && !image.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, image.getBytes());
                product.setImageUrl("/api/products/images/" + fileName);
            }

            return productService.updateProduct(id, product)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Serve product images
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir + filename);
            Resource resource = new org.springframework.core.io.FileSystemResource(filePath.toFile());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
