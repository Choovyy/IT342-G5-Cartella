package cit.edu.cartella.controller;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import cit.edu.cartella.util.JwtUtil;


import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class OAuth2Controller {

     @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Redirects users to the Google OAuth2 login flow
    @GetMapping("/login/google")
    public String googleLogin() {
        // Redirect to Spring Security's OAuth2 login endpoint
        return "redirect:/oauth2/authorization/google";
    }

    // Returns user attributes after successful OAuth2 login
    @GetMapping("/oauth2/success")
    public Map<String, Object> success(@AuthenticationPrincipal OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String providerId = oauth2User.getAttribute("sub"); // Google unique ID

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (!existingUser.isPresent()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setProvider("GOOGLE");
            newUser.setProviderId(providerId);
            newUser.onCreate(); // Automatically set createdAt and updatedAt timestamps

            userRepository.save(newUser);
        }

        // Get the username from the user record
        String username = existingUser.isPresent() ? existingUser.get().getUsername() : name;

        // Generate a JWT token for the user using username
        String token = jwtUtil.generateToken(username);

        // Return the token and user attributes
        Map<String, Object> response = oauth2User.getAttributes();
        response.put("token", token); // Include the token in the response
        response.put("username", username); // Include the username in the response
        return response;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.err.println("Missing or invalid Authorization header: " + authHeader);
                return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            System.out.println("Extracted token: " + token);
            
            String usernameOrEmail = jwtUtil.extractUsername(token); // works for both normal & Google users
            System.out.println("Extracted username/email from token: " + usernameOrEmail);

            // Try to fetch by username first, fallback to email
            Optional<User> user = userRepository.findByUsername(usernameOrEmail);
            if (user.isEmpty()) {
                System.out.println("User not found by username, trying email");
                user = userRepository.findByEmail(usernameOrEmail);
            }

            if (user.isEmpty()) {
                System.err.println("User not found for username/email: " + usernameOrEmail);
                return ResponseEntity.status(404).body("User not found");
            }

            User u = user.get();
            System.out.println("Found user: " + u.getUsername() + ", email: " + u.getEmail());
            
            Map<String, Object> response = Map.of(
                "username", u.getUsername(),
                "email", u.getEmail(),
                "phoneNumber", u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                "dateOfBirth", u.getDateOfBirth() != null ? u.getDateOfBirth() : "",
                "gender", u.getGender() != null ? u.getGender() : ""
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getUserInfo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
    
}
