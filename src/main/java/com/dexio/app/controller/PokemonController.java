package com.dexio.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.dexio.app.service.*;
import com.dexio.app.dto.*;

import java.util.List;

@RestController
public class PokemonController {

    @Autowired
    private ApiService apiService;

    @GetMapping("/api/pokemons")
    public List<Pokemon> listar(@RequestParam int offset, @RequestParam int limit) {
        return apiService.buscarPokemons(offset, limit);
    }
}