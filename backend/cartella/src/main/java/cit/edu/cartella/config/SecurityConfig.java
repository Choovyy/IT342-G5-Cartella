package cit.edu.cartella.config;


import cit.edu.cartella.service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    public SecurityConfig(CustomOAuth2SuccessHandler customOAuth2SuccessHandler,
                          CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers(
                                "/",
                                "/api/users/register",
                                "/api/users/login",
                                "/api/vendors/login",
                                "/api/vendors/register",
                                "/api/users/**",
                                "/login/google",
                                "/oauth2/success",
                                "/dashboard",
                                "/oauth2/authorization/google",
                                "/api/addresses/**",
                                "/api/vendor-dashboard/**",
                                "/api/vendors/**",
                                "/api/products/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth ->
                        oauth
                            .successHandler(customOAuth2SuccessHandler)
                            .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                )
                .logout(logout ->
                        logout.logoutSuccessHandler(oidcLogoutSuccessHandler(clientRegistrationRepository))
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
        OidcClientInitiatedLogoutSuccessHandler successHandler =
                new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);
        successHandler.setPostLogoutRedirectUri("http://localhost:5173");
        return successHandler;
    }
}
