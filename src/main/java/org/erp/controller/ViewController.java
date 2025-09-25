package org.erp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping(value = {"/", "/login", "/dashboard"})
    public String index() {
        return "forward:/index.html";
    }
}