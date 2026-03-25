package com.dexio.app.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.cient.WebClient;

@RestController
@Service
@RequestMapping("/api")
public class ApiService {

    private final WebClient webClient;

    public ApiService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://pokeapi.co/api/v2/pokemon/pikachu").build();
    }

    public String buscarDados() {
        return webClient.get()
                .uri("/api")
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
    
}