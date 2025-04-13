package cit.edu.cartella.service;

import cit.edu.cartella.entity.User;
import cit.edu.cartella.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import cit.edu.cartella.util.JwtUtil;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^\\d{11}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Autowired
    private JwtUtil jwtUtil; // Inject JwtUtil

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUser(User user) {
        // If password is provided and not already encrypted, encrypt it
        if (user.getPassword() != null && !user.getPassword().isEmpty() && 
            !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // Validate email format if provided
        if (user.getEmail() != null && !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        // Validate phone number if provided
        if (user.getPhoneNumber() != null && !PHONE_PATTERN.matcher(user.getPhoneNumber()).matches()) {
            throw new IllegalArgumentException("Phone number must be exactly 11 digits");
        }
        
        // Check for duplicate username if username is being updated
        if (user.getUsername() != null) {
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
                throw new IllegalArgumentException("Username is already taken");
            }
        }
        
        // Check for duplicate email if email is being updated
        if (user.getEmail() != null) {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
                throw new IllegalArgumentException("Email is already registered");
            }
        }
        
        // Check for duplicate phone number if phone number is being updated
        if (user.getPhoneNumber() != null) {
            Optional<User> existingUser = userRepository.findByPhoneNumber(user.getPhoneNumber());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
                throw new IllegalArgumentException("Phone number is already registered");
            }
        }
        
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User registerUser(User user) {
        // Validate email format
        if (!EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    
        // Validate phone number (exactly 11 digits)
        if (!PHONE_PATTERN.matcher(user.getPhoneNumber()).matches()) {
            throw new IllegalArgumentException("Phone number must be exactly 11 digits");
        }
    
        // Check for existing username
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
    
        // Check for existing email
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }
    
        // Check for existing phone number
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number is already registered");
        }
    
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean authenticateUser(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return false; // User not found
        }
        User user = userOptional.get();
        return passwordEncoder.matches(password, user.getPassword());
    }

    public String generateToken(String username) {
        return jwtUtil.generateToken(username);
    }
    
}

