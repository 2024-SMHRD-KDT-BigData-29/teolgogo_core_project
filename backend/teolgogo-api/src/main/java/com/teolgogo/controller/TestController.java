package com.teolgogo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "털고고 API 서버가 정상적으로 작동 중입니다.";
    }

    @GetMapping("/api/test")
    public String test() {
        return "API 테스트 성공!";
    }
}