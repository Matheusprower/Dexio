package com.dexio.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PublicController {

    @GetMapping("/hall-da-fama")
    public String hallDaFama(@RequestParam("data") String data, Model model) {
        model.addAttribute("hofData", data);
        return "hall-da-fama";
    }
}
