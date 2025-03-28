package com.teolgogo.controller;

import com.teolgogo.dto.LoginRequest;
import com.teolgogo.dto.SignupRequest;
import com.teolgogo.dto.TokenResponse;
import com.teolgogo.entity.User;
import com.teolgogo.service.AuthService;
import com.teolgogo.util.CookieUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtils cookieUtils;

    @Autowired
    public AuthController(AuthService authService, CookieUtils cookieUtils) {
        this.authService = authService;
        this.cookieUtils = cookieUtils;
    }

    // 로그인 API
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        TokenResponse tokenResponse = authService.login(loginRequest, response);
        return ResponseEntity.ok(tokenResponse);
    }

    // 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        User user = authService.signup(signupRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("message", "회원가입이 성공적으로 완료되었습니다.");

        return ResponseEntity.ok(response);
    }

    // 액세스 토큰 갱신 API
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        Optional<String> refreshToken = cookieUtils.getCookie(request, "refresh_token")
                .map(cookie -> cookie.getValue());

        if (!refreshToken.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        TokenResponse tokenResponse = authService.refreshToken(refreshToken.get());
        return ResponseEntity.ok(tokenResponse);
    }

    // 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        authService.logout(response);

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "로그아웃되었습니다.");

        return ResponseEntity.ok(responseBody);
    }

    // 이메일 중복 확인 API
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = false; // 실제로는 서비스를 통해 확인

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }
}