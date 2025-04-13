package cit.edu.cartella.controller;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.service.UserService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;


import java.util.*;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user, BindingResult bindingResult) {
    // Check for validation errors
    if (bindingResult.hasErrors()) {
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
    
    try {
        // Attempt to register the user
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    } catch (IllegalArgumentException ex) {
        // Handle duplicate username, email, or phone number
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData) {
    String username = loginData.get("username");
    String password = loginData.get("password");
    boolean isAuthenticated = userService.authenticateUser(username, password);

    if (isAuthenticated) {
        // Generate a JWT token for the authenticated user
        String token = userService.generateToken(username);
        // Prepare the response with the token
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        

        return ResponseEntity.ok(response);
    } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
}

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
        try {
            // Get the existing user
            Optional<User> existingUserOpt = userService.getUserById(id);
            if (existingUserOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User existingUser = existingUserOpt.get();
            
            // Update only the fields that are provided
            if (userDetails.getUsername() != null) {
                existingUser.setUsername(userDetails.getUsername());
            }
            if (userDetails.getEmail() != null) {
                existingUser.setEmail(userDetails.getEmail());
            }
            if (userDetails.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(userDetails.getPhoneNumber());
            }
            if (userDetails.getDateOfBirth() != null) {
                existingUser.setDateOfBirth(userDetails.getDateOfBirth());
            }
            if (userDetails.getGender() != null) {
                existingUser.setGender(userDetails.getGender());
            }
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(userDetails.getPassword());
            }
            
            // Save the updated user
            User updatedUser = userService.saveUser(existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
