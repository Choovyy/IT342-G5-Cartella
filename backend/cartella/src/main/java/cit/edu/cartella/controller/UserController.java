package cit.edu.cartella.controller;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    } catch (IllegalArgumentException ex) {
        // Return a 400 Bad Request with the error message
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

   

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
