package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserUserId(Long userId);
}
