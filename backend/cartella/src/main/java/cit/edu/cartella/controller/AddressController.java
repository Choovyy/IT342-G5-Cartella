package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Address;
import cit.edu.cartella.entity.User;
//import cit.edu.cartella.repository.AddressRepository;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;
    

    @Autowired
    public AddressController(AddressService addressService, UserRepository userRepository) {
        this.addressService = addressService;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable Long userId) {
        List<Address> addresses = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/user/email/{email}")
    public ResponseEntity<List<Address>> getAddressesByUserEmail(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Address> addresses = addressService.getAddressesByUserId(userOpt.get().getUserId());
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/user/username/{username}")
    public ResponseEntity<List<Address>> getAddressesByUsername(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Address> addresses = addressService.getAddressesByUserId(userOpt.get().getUserId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createAddress(@PathVariable Long userId, @RequestBody Address address) {
        try {
            Address savedAddress = addressService.createAddress(userId, address);
            return ResponseEntity.ok(savedAddress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/user/email/{email}")
    public ResponseEntity<?> createAddressByEmail(@PathVariable String email, @RequestBody Address address) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Address savedAddress = addressService.createAddress(userOpt.get().getUserId(), address);
            return ResponseEntity.ok(savedAddress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long addressId, @RequestBody Address address) {
        try {
            Address updatedAddress = addressService.updateAddress(addressId, address);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long addressId) {
        try {
            Address updatedAddress = addressService.setDefaultAddress(addressId);
            
            // Log the response for debugging
            System.out.println("Response - Address ID: " + updatedAddress.getAddressId());
            System.out.println("Response - isDefault: " + updatedAddress.isDefault());
            
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            System.out.println("Error setting default address: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 