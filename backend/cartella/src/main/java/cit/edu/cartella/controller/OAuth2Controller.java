package cit.edu.cartella.controller;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import cit.edu.cartella.util.JwtUtil;


import java.util.Map;
import java.util.Optional;

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

        // Generate a JWT token for the user
        String token = jwtUtil.generateToken(email);

        // Return the token and user attributes
        Map<String, Object> response = oauth2User.getAttributes();
        response.put("token", token); // Include the token in the response
        return response;
    }

    // Returns user attributes for the dashboard
    @GetMapping("/dashboard")
    public Map<String, Object> getUserInfo(OAuth2AuthenticationToken authentication) {
        return authentication.getPrincipal().getAttributes();
    }
}
