package com.dexio.app.controller;

import com.dexio.app.entity.Usuario;
import com.dexio.app.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.dexio.app.util.PasswordUtil;
import java.util.Optional;

@Controller
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String senha, HttpSession session) {
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
        if (userOpt.isPresent() && PasswordUtil.checkPassword(senha, userOpt.get().getSenha())) {
            Usuario u = userOpt.get();
            // Migra para hash se ainda estiver em plaintext
            if (senha.equals(u.getSenha())) {
                u.setSenha(PasswordUtil.hashPassword(senha));
                usuarioRepository.save(u);
            }
            // Login com sucesso
            session.setAttribute("loggedUser", u);
            return "redirect:/pokedex";
        }
        return "redirect:/?error=true";
    }

    @PostMapping("/cadastro")
    public String cadastro(@RequestParam String nome, @RequestParam String email, @RequestParam String senha) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return "redirect:/?error=email_exists";
        }
        
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(nome);
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(PasswordUtil.hashPassword(senha));
        // O primeiro a se cadastrar vira admin automaticamente para facilitar seus testes
        if (usuarioRepository.count() == 0) {
            novoUsuario.setAdmin(true);
        } else {
            novoUsuario.setAdmin(false);
        }
        usuarioRepository.save(novoUsuario);

        return "redirect:/?success=true";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}
