package com.dexio.app.controller;

import com.dexio.app.entity.Usuario;
import com.dexio.app.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dexio.app.util.PasswordUtil;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private com.dexio.app.repository.PokemonRepository pokemonRepository;

    // Retorna todos os usuários
    @GetMapping("/users")
    public ResponseEntity<List<Usuario>> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    // Atualiza um usuário (Nome, e-mail, senha, status admin)
    @PostMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Usuario dadosAtualizados, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();

        Optional<Usuario> opt = usuarioRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Usuario u = opt.get();
        if (dadosAtualizados.getNome() != null) u.setNome(dadosAtualizados.getNome());
        if (dadosAtualizados.getEmail() != null) u.setEmail(dadosAtualizados.getEmail());
        if (dadosAtualizados.getSenha() != null && !dadosAtualizados.getSenha().isEmpty()) {
            u.setSenha(PasswordUtil.hashPassword(dadosAtualizados.getSenha()));
        }
        if (dadosAtualizados.getAdmin() != null) {
            u.setAdmin(dadosAtualizados.getAdmin());
        }

        usuarioRepository.save(u);
        return ResponseEntity.ok(u);
    }

    @PostMapping("/resetBackup")
    public ResponseEntity<?> resetBackup(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        
        pokemonRepository.resetAllBackups();
        
        return ResponseEntity.ok().build();
    }

    private boolean isAdmin(HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("loggedUser");
        return user != null && user.getAdmin() != null && user.getAdmin();
    }
}
