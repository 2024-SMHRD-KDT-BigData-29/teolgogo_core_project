package com.teolgogo.service;

import com.teolgogo.dto.LoginRequest;
import com.teolgogo.dto.SignupRequest;
import com.teolgogo.dto.TokenResponse;
import com.teolgogo.entity.User;
import com.teolgogo.repository.UserRepository;
import com.teolgogo.security.JwtTokenProvider;
import com.teolgogo.util.CookieUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CookieUtils cookieUtils;

    @Autowired
    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            CookieUtils cookieUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.cookieUtils = cookieUtils;
    }

    // 로그인 처리
    public TokenResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        String accessToken = tokenProvider.createAccessToken(user);
        String refreshToken = tokenProvider.createRefreshToken(user);

        // 리프레시 토큰은 쿠키에 저장
        int refreshTokenMaxAge = (int) (tokenProvider.getRefreshTokenExpirationMsec() / 1000);
        cookieUtils.addRefreshTokenCookie(response, refreshToken, refreshTokenMaxAge);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMsec() / 1000)
                .build();
    }

    // 회원가입 처리
    @Transactional
    public User signup(SignupRequest signupRequest) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 사용자 객체 생성
        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(signupRequest.getRole() != null ? signupRequest.getRole() : User.Role.CUSTOMER)
                .provider(User.AuthProvider.LOCAL)
                .build();

        // 업체 회원인 경우 추가 정보 설정
        if (user.getRole() == User.Role.BUSINESS) {
            user.setBusinessName(signupRequest.getBusinessName());
            user.setBusinessDescription(signupRequest.getBusinessDescription());
            user.setBusinessLicense(signupRequest.getBusinessLicense());
        }

        return userRepository.save(user);
    }

    // 리프레시 토큰으로 새 액세스 토큰 발급
    public TokenResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        Optional<User> userOpt = userRepository.findById(userId);

        if (!userOpt.isPresent()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        User user = userOpt.get();
        String accessToken = tokenProvider.createAccessToken(user);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMsec() / 1000)
                .build();
    }

    // 로그아웃 처리
    public void logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        cookieUtils.deleteRefreshTokenCookie(response);
    }
}