package cit.edu.cartella.config;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.util.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.core.user.OAuth2User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public CustomOAuth2SuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                      HttpServletResponse response, 
                                      Authentication authentication) throws IOException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            
            // Debug: Log all attributes
            System.out.println("OAuth2 User Attributes:");
            oauth2User.getAttributes().forEach((key, value) -> 
                System.out.println(key + ": " + value));
            
            // Extract email from attributes
            String email = oauth2User.getAttribute("email");
            if (email == null || email.isEmpty()) {
                System.err.println("Email attribute is missing or empty");
                response.sendRedirect("http://localhost:5173/login?error=missing_email");
                return;
            }
            
            // Get the user from the database to access their ID
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.err.println("User not found for email: " + email);
                response.sendRedirect("http://localhost:5173/login?error=user_not_found");
                return;
            }
            
            User user = userOpt.get();
            
            // Generate token with additional claims if needed
            String token = jwtUtil.generateToken(email);
            System.out.println("Generated Token: " + token); // Debugging: Log the token
            
            // URL encode the token for safe redirect
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String encodedUserId = URLEncoder.encode(user.getUserId().toString(), StandardCharsets.UTF_8);
            
            // Redirect to frontend with token - make sure this matches the route in App.jsx
            String redirectUrl = "http://localhost:5173/oauth-success?token=" + encodedToken + 
                               "&email=" + encodedEmail + 
                               "&userId=" + encodedUserId;
            System.out.println("Redirecting to: " + redirectUrl); // Debug: Log the redirect URL
            
            // Set CORS headers for the redirect
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            System.err.println("Error in OAuth success handler: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("http://localhost:5173/login?error=oauth_failed");
        }
    }
}