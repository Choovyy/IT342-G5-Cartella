package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUserUserId(Long userId);

    Optional<Vendor> findByBusinessRegistrationNumber(String businessRegNum);
}
