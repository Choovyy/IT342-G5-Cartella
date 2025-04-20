package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get all products by vendor
    List<Product> findByVendor(Vendor vendor);

    // Find a product by name (Optional for searching)
    Optional<Product> findByName(String name);

    // Get all products by category
    List<Product> findByCategory(String category);
    
    // Get all products by category (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:category)")
    List<Product> findByCategoryIgnoreCase(@Param("category") String category);

    List<Product> findByVendorVendorId(Long vendorId);

    List<Product> findByVendorVendorIdAndCategory(Long vendorId, String category);
    
    // Get all products by vendor and category (case-insensitive)
    @Query("SELECT p FROM Product p WHERE p.vendor.vendorId = :vendorId AND LOWER(p.category) = LOWER(:category)")
    List<Product> findByVendorVendorIdAndCategoryIgnoreCase(@Param("vendorId") Long vendorId, @Param("category") String category);
}
