package com.dexio.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/helloworld")
public class HelloWorldController {

    @GetMapping
    public String helloWorld() {
        return "Matheus Teste!!";
    }
    
}