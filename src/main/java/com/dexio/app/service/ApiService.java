package com.dexio.app.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiService {

    private final WebClient webClient;

    public ApiService(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://pokeapi.co/api/v2/pokemon")
                .build();
    }

    public String buscarDados() {
        return webClient.get()
                .uri("/pikachu")
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}