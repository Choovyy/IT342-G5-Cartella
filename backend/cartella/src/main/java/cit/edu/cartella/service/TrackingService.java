package cit.edu.cartella.service;

import cit.edu.cartella.entity.Tracking;
import cit.edu.cartella.repository.TrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TrackingService {

    private final TrackingRepository trackingRepository;

    @Autowired
    public TrackingService(TrackingRepository trackingRepository) {
        this.trackingRepository = trackingRepository;
    }

    public Optional<Tracking> getTrackingByOrderId(Long orderId) {
        return trackingRepository.findByOrder_OrderId(orderId);
    }

    public Tracking saveTracking(Tracking tracking) {
        return trackingRepository.save(tracking);
    }
}
