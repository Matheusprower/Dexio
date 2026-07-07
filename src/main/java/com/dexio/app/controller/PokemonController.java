package com.dexio.app.controller;

import com.dexio.app.entity.Pokemon;
import com.dexio.app.repository.PokemonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pokemon")
public class PokemonController {

    @Autowired
    private PokemonRepository pokemonRepository;

    @GetMapping("/list")
    public ResponseEntity<List<Pokemon>> listAll() {
        return ResponseEntity.ok(pokemonRepository.findAll());
    }

    @PostMapping("/salvarLista")
    public ResponseEntity<String> salvarLista(@RequestBody List<Pokemon> pokemons) {
        java.util.Set<String> nomesExistentes = pokemonRepository.findAll().stream()
                .map(p -> p.getNome().toLowerCase())
                .collect(java.util.stream.Collectors.toSet());

        List<Pokemon> novosPokemons = pokemons.stream()
                .filter(p -> !nomesExistentes.contains(p.getNome().toLowerCase()))
                .peek(p -> p.setDetalhesCarregados(false))
                .collect(java.util.stream.Collectors.toList());

        if (!novosPokemons.isEmpty()) {
            pokemonRepository.saveAll(novosPokemons);
        }

        return ResponseEntity.ok("Lista salva com sucesso!");
    }

    @GetMapping("/{nome}")
    public ResponseEntity<Pokemon> getPokemon(@PathVariable String nome) {
        Optional<Pokemon> p = pokemonRepository.findByNome(nome.toLowerCase());
        if (p.isPresent() && Boolean.TRUE.equals(p.get().getDetalhesCarregados())) {
            return ResponseEntity.ok(p.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/salvarDetalhes")
    public ResponseEntity<Pokemon> salvarDetalhes(@RequestBody Pokemon pokemonDetails) {
        Optional<Pokemon> pOpt = pokemonRepository.findByNome(pokemonDetails.getNome().toLowerCase());
        Pokemon p;
        if (pOpt.isPresent()) {
            p = pOpt.get();
        } else {
            p = new Pokemon();
            p.setId(pokemonDetails.getId());
            p.setNome(pokemonDetails.getNome().toLowerCase());
        }

        p.setSpriteUrl(pokemonDetails.getSpriteUrl());
        p.setTipos(pokemonDetails.getTipos());
        p.setEggGroups(pokemonDetails.getEggGroups());
        p.setEvolutionChain(pokemonDetails.getEvolutionChain());
        p.setLocaisCaptura(pokemonDetails.getLocaisCaptura());
        p.setAtaques(pokemonDetails.getAtaques());
        p.setFormas(pokemonDetails.getFormas());
        p.setDetalhesCarregados(true);
        p.setDataBackup(java.time.LocalDate.now());

        return ResponseEntity.ok(pokemonRepository.save(p));
    }
}