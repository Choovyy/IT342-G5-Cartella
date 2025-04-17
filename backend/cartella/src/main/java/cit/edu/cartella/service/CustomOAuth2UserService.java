package cit.edu.cartella.service;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract user info from Google
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String googleId = (String) attributes.get("sub");

        // Check if user exists
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Generate a unique username from the email or name
            String username = generateUniqueUsername(email, name);
            
            // New Google User → Save to DB
            user = new User(email, username, "GOOGLE", googleId);
            userRepository.save(user);
        }

        return oauth2User;
    }
    
    /**
     * Generate a unique username from email or name
     * @param email User's email
     * @param name User's name
     * @return A unique username
     */
    private String generateUniqueUsername(String email, String name) {
        // Try to use the part of the email before @ as username
        String baseUsername = email.split("@")[0];
        
        // Check if username already exists
        if (userRepository.findByUsername(baseUsername).isEmpty()) {
            return baseUsername;
        }
        
        // If username exists, try with name (lowercase, no spaces)
        String nameUsername = name.toLowerCase().replaceAll("\\s+", "");
        if (userRepository.findByUsername(nameUsername).isEmpty()) {
            return nameUsername;
        }
        
        // If both exist, append a random number
        int counter = 1;
        String newUsername;
        do {
            newUsername = baseUsername + counter;
            counter++;
        } while (userRepository.findByUsername(newUsername).isPresent());
        
        return newUsername;
    }
}
