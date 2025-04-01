package cit.edu.cartella.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class OAuth2Controller {

    @GetMapping("/oauth2/success")
    public Map<String, Object> success(@AuthenticationPrincipal OAuth2User oauth2User) {
        return oauth2User.getAttributes();
    }

     @GetMapping("/dashboard")
    public Map<String, Object> getUserInfo(OAuth2AuthenticationToken authentication) {
        return authentication.getPrincipal().getAttributes();
    }
}
// This controller handles the successful OAuth2 login and returns the user attributes as a JSON response. The @AuthenticationPrincipal annotation is used to inject the authenticated user's details into the method parameter. The success method is mapped to the "/oauth2/success" endpoint, which is called after a successful login. The user attributes are returned as a JSON response.
// This allows the frontend to access user information after login, such as name and email.
// The @RestController annotation indicates that this class is a REST controller, and the @GetMapping annotation maps HTTP GET requests to the specified method. The method returns a Map containing the user attributes, which will be automatically converted to JSON by Spring.
// The @AuthenticationPrincipal annotation is used to inject the authenticated user's details into the method parameter. The success method is mapped to the "/oauth2/success" endpoint, which is called after a successful login. The user attributes are returned as a JSON response. This allows the frontend to access user information after login, such as name and email.
// The @RestController annotation indicates that this class is a REST controller, and the @GetMapping annotation maps HTTP GET requests to the specified method. The method returns a Map containing the user attributes, which will be automatically converted to JSON by Spring.

