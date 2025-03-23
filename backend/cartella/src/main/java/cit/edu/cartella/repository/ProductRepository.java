package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Product;
import cit.edu.cartella.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
