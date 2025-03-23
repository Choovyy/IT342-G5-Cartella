package cit.edu.cartella.repository;

import cit.edu.cartella.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserId(Long userId);
}
