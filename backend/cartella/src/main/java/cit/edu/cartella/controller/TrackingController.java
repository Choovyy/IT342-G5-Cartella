package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Tracking;
import cit.edu.cartella.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    @Autowired
    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Tracking> getTrackingByOrderId(@PathVariable Long orderId) {
        return trackingService.getTrackingByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Tracking createTracking(@RequestBody Tracking tracking) {
        return trackingService.saveTracking(tracking);
    }
}
