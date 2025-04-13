package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Role;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.entity.Vendor;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.repository.VendorRepository;
import cit.edu.cartella.service.UserService;
import cit.edu.cartella.service.VendorService;
import cit.edu.cartella.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    public VendorController(
            VendorService vendorService,
            UserRepository userRepository,
            VendorRepository vendorRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder
    ) {
        this.vendorService = vendorService;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Vendor> createVendor(@PathVariable Long userId, @RequestBody Vendor vendor) {
        Vendor createdVendor = vendorService.createVendor(userId, vendor);
        return ResponseEntity.ok(createdVendor);
    }

    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorService.getAllVendors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Vendor> getVendorByUserId(@PathVariable Long userId) {
        return vendorService.getVendorByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @RequestBody Vendor vendorDetails) {
        Vendor updatedVendor = vendorService.updateVendor(id, vendorDetails);
        return ResponseEntity.ok(updatedVendor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> vendorLogin(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        if (user.getRole() != Role.VENDOR) {
            return ResponseEntity.status(403).body(Map.of("error", "User is not a vendor"));
        }

        Optional<Vendor> vendorOpt = vendorRepository.findByUserUserId(user.getUserId());
        if (vendorOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Vendor profile not found"));
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.getUserId(),
            "vendorId", vendorOpt.get().getVendorId(),
            "message", "Vendor login successful"
        ));
    }

    @PostMapping("/register")
public ResponseEntity<?> registerVendor(@RequestBody Map<String, String> payload) {
    try {
        // Extract fields
        String username = payload.get("username");
        String password = payload.get("password");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String dob = payload.get("dob");
        String gender = payload.get("gender");

        String businessName = payload.get("businessName");
        String businessAddress = payload.get("businessAddress");
        String businessRegNum = payload.get("businessRegistrationNumber");

        // Create user entity with role VENDOR
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Will be encoded in saveUser
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setDateOfBirth(dob);
        user.setGender(Enum.valueOf(cit.edu.cartella.entity.Gender.class, gender.toUpperCase()));
        user.setRole(cit.edu.cartella.entity.Role.VENDOR);

        user = userService.saveUser(user); // saves and returns with userId

        // Create vendor entity and link to user
        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setBusinessName(businessName);
        vendor.setBusinessAddress(businessAddress);
        vendor.setBusinessRegistrationNumber(businessRegNum);

        vendor = vendorService.createVendor(user.getUserId(), vendor);

        // Generate token for auto-login after register (optional)
        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of(
            "message", "Vendor registered successfully",
            "token", token,
            "userId", user.getUserId(),
            "vendorId", vendor.getVendorId()
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

}
