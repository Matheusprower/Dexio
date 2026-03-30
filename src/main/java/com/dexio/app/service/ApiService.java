package com.dexio.app.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import com.dexio.app.dto.*;

import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class ApiService {

    @Autowired
    private RestTemplate restTemplate;

    public List<Pokemon> buscarPokemons(int offset, int limit) {
        String url = "https://pokeapi.co/api/v2/pokemon?limite=" + limit + "&offset=" + offset;

        PokemonResposta response =
            restTemplate.getForObject(url, PokemonResposta.class);

        return response.getResults();
    }
}