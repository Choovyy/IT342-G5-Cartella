package cit.edu.cartella.config;

import cit.edu.cartella.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;




@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

    private final CustomOAuth2UserService oAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService oAuth2UserService) {
        this.oAuth2UserService = oAuth2UserService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/", "/login", "/register", "/products", "/api/users/register", "/api/users/login").permitAll() // Public endpoints
                    .anyRequest().authenticated() // All other requests require authentication
                )
                .oauth2Login(oauth -> oauth
                    .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService)) // Custom OAuth2 user service
                    .defaultSuccessUrl("/oauth2/success", true) // Redirect after successful login
                )
                .logout(logout -> logout.logoutSuccessUrl("/")) // Redirect to home page after logout
                .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in this case
                .build();
    }

    // CORS configuration using WebMvcConfigurer
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173") // Allow the frontend to make requests to the backend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
