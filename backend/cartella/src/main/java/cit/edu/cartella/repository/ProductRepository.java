package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByVendor_VendorId(Long vendorId);
}
