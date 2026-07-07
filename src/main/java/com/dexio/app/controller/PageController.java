package com.dexio.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PageController {

    @GetMapping("/")
    public String telaIncio() {
        return "login";
    }

    @GetMapping("/pokedex")
    public String telaPokedex() {
        return "index";
    }

    @GetMapping("/admin")
    public String telaAdmin() {
        return "admin";
    }

    @GetMapping("/times")
    public String telaTimes() {
        return "times";
    }
}