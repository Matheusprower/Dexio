package com.dexio.app.interceptor;

import com.dexio.app.entity.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        
        // Permite o carregamento de arquivos estáticos e de imagens
        if (uri.endsWith(".css") || uri.endsWith(".js") || uri.endsWith(".png") || uri.endsWith(".jpg") || uri.endsWith(".jpeg") || 
            uri.startsWith("/api/pokemon/list") || uri.startsWith("/api/pokemon/salvarLista") || uri.startsWith("/hall-da-fama")) {
            return true; 
        }
        
        HttpSession session = request.getSession();
        Usuario user = (Usuario) session.getAttribute("loggedUser");

        // Regras para as páginas de login
        if (uri.equals("/") || uri.equals("/login") || uri.equals("/cadastro")) {
            if (user != null) {
                response.sendRedirect("/pokedex");
                return false;
            }
            return true; // Se não tá logado, deixa acessar o login
        }

        // Se tentou acessar qualquer rota protegida e não tá logado -> Vai para o login
        if (user == null) {
            response.sendRedirect("/");
            return false;
        }

        // Se tentou acessar área admin, verifica
        if (uri.startsWith("/admin") || uri.startsWith("/api/admin")) {
            if (user.getAdmin() == null || !user.getAdmin()) {
                response.sendRedirect("/pokedex");
                return false;
            }
        }
        
        return true;
    }
}
