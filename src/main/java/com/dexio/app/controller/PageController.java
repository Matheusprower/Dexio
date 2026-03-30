package com.dexio.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.stereotype.Controller;
import com.dexio.app.service.ApiService;

@Controller
public class PageController {

    @GetMapping("/")
    public String telaIncio() {
        return "index";
    }
}