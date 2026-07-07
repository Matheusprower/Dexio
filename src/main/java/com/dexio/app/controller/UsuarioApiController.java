package com.dexio.app.controller;

import com.dexio.app.entity.Usuario;
import com.dexio.app.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioApiController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public ResponseEntity<Usuario> getMe(HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("loggedUser");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        // Atualiza para pegar dados mais recentes
        return ResponseEntity.ok(usuarioRepository.findById(user.getId()).orElse(user));
    }

    @PostMapping("/toggleCaptura/{pokemonId}")
    public ResponseEntity<?> toggleCaptura(@PathVariable Long pokemonId, HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("loggedUser");
        if (user == null) return ResponseEntity.status(401).build();

        user = usuarioRepository.findById(user.getId()).orElse(null);
        if(user == null) return ResponseEntity.status(401).build();

        Set<Long> capturados = new HashSet<>();
        if (user.getCapturas() != null && !user.getCapturas().isEmpty()) {
            // Converte string estilo "[1, 2, 3]"
            String clean = user.getCapturas().replaceAll("\\[|\\]", "");
            if (!clean.isEmpty()) {
                capturados = Arrays.stream(clean.split(","))
                        .map(String::trim)
                        .map(Long::valueOf)
                        .collect(Collectors.toSet());
            }
        }

        if (capturados.contains(pokemonId)) {
            capturados.remove(pokemonId);
        } else {
            capturados.add(pokemonId);
        }

        user.setCapturas(capturados.toString());
        usuarioRepository.save(user);
        session.setAttribute("loggedUser", user);

        return ResponseEntity.ok(capturados);
    }

    @GetMapping("/times")
    public ResponseEntity<String> getTimes(HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("loggedUser");
        if (user == null) return ResponseEntity.status(401).build();

        user = usuarioRepository.findById(user.getId()).orElse(null);
        if(user == null) return ResponseEntity.status(401).build();

        String times = user.getTimes() == null || user.getTimes().trim().isEmpty() ? "[]" : user.getTimes();
        return ResponseEntity.ok(times);
    }

    @PostMapping("/times")
    public ResponseEntity<?> saveTimes(@RequestBody String timesJson, HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("loggedUser");
        if (user == null) return ResponseEntity.status(401).build();

        user = usuarioRepository.findById(user.getId()).orElse(null);
        if(user == null) return ResponseEntity.status(401).build();

        user.setTimes(timesJson);
        usuarioRepository.save(user);
        session.setAttribute("loggedUser", user);

        return ResponseEntity.ok().build();
    }
}
