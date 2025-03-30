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

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        System.out.println("회원가입 요청 받음: " + signupRequest.toString());

        try {
            // 약관 동의 검증
            if (signupRequest.getAgreeTerms() == null || !signupRequest.getAgreeTerms() ||
                    signupRequest.getAgreePrivacy() == null || !signupRequest.getAgreePrivacy()) {
                System.out.println("약관 동의 검증 실패");
                Map<String, String> response = new HashMap<>();
                response.put("message", "이용약관 및 개인정보 처리방침에 동의해주세요.");
                return ResponseEntity.badRequest().body(response);
            }

            User user = authService.signup(signupRequest);

            System.out.println("회원가입 성공: " + user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("message", "회원가입이 성공적으로 완료되었습니다.");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("이미 사용 중인 이메일")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", e.getMessage());
                return ResponseEntity.status(400).body(errorResponse);
            }
            // 다른 런타임 예외는 그대로 던짐
            throw e;
        }
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