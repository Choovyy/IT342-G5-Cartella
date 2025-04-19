package cit.edu.cartella.controller;

import cit.edu.cartella.entity.Role;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.entity.Vendor;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.repository.VendorRepository;
import cit.edu.cartella.service.UserService;
import cit.edu.cartella.service.VendorService;
import cit.edu.cartella.util.JwtUtil;
import java.util.regex.Pattern;

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
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{11}$");

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

        Vendor vendor = vendorOpt.get();
        String token = jwtUtil.generateToken(user.getUsername());
        
        // Format the joined date
        String joinedDate = vendor.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy"));

        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.getUserId(),
            "vendorId", vendor.getVendorId(),
            "businessName", vendor.getBusinessName(),
            "joinedDate", joinedDate,
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

        // Validate email format
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Validate phone number (exactly 11 digits)
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Phone number must be exactly 11 digits");
        }

        // Check for existing username
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Check for existing email
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Check for existing phone number
        if (userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new IllegalArgumentException("Phone number is already registered");
        }
        if (dob == null || dob.isEmpty()) {
            throw new IllegalArgumentException("Date of birth is required");
            
        }
        //check if regisnum is duplicate
        if (vendorRepository.findByBusinessRegistrationNumber(businessRegNum).isPresent()) {
            throw new IllegalArgumentException("Business registration number is already registered");
        }

        // Create user entity with role VENDOR
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Will be encoded in saveUser
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setDateOfBirth(dob);
        user.setGender(Enum.valueOf(cit.edu.cartella.entity.Gender.class, gender.toUpperCase()));
        user.setRole(cit.edu.cartella.entity.Role.VENDOR);

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
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
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
    }
}



}
