package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrackingRepository extends JpaRepository<Tracking, Long> {
    Optional<Tracking> findByOrder_OrderId(Long orderId);
}
