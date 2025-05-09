package cit.edu.cartella.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class checkController {
    
    @GetMapping("/")
    public String checkBackend() {
        return "hello yes my backend works";
    }
}
