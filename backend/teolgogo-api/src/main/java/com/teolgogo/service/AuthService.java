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
        try {
            System.out.println("로그인 시도: " + loginRequest.getEmail());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            System.out.println("인증 성공: " + loginRequest.getEmail());

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = (User) authentication.getPrincipal();
            System.out.println("사용자 정보 로드: " + user.getEmail() + ", 역할: " + user.getRole());

            String accessToken = tokenProvider.createAccessToken(user);
            String refreshToken = tokenProvider.createRefreshToken(user);

            System.out.println("로그인 토큰 생성 - 액세스 토큰: " + accessToken.substring(0, 20) + "...");
            System.out.println("로그인 토큰 생성 - 리프레시 토큰: " + refreshToken.substring(0, 20) + "...");

            // 리프레시 토큰은 쿠키에 저장
            int refreshTokenMaxAge = (int) (tokenProvider.getRefreshTokenExpirationMsec() / 1000);
            CookieUtils.addRefreshTokenCookie(response, refreshToken, refreshTokenMaxAge);

            TokenResponse tokenResponse = TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getAccessTokenExpirationMsec() / 1000)
                    .build();

            System.out.println("토큰 응답 생성 완료");
            return tokenResponse;
        } catch (Exception e) {
            System.err.println("로그인 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;  // 원래 예외를 다시 던져서 정상적인 오류 처리 흐름 유지
        }
    }

    // 회원가입 처리
    @Transactional
    public User signup(SignupRequest signupRequest) {
        System.out.println("회원가입 요청 받음: " + signupRequest.getEmail());

        // 이메일 중복 확인
        boolean exists = userRepository.existsByEmail(signupRequest.getEmail());
        System.out.println("이메일 중복 여부: " + exists);

        if (exists) {
            System.out.println("이미 사용 중인 이메일: " + signupRequest.getEmail());
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 전화번호 중복 확인 추가
        if (signupRequest.getPhone() != null && !signupRequest.getPhone().isEmpty()) {
            boolean phoneExists = userRepository.existsByPhone(signupRequest.getPhone());
            System.out.println("전화번호 중복 여부: " + phoneExists);

            if (phoneExists) {
                System.out.println("이미 사용 중인 전화번호: " + signupRequest.getPhone());
                throw new RuntimeException("이미 사용 중인 전화번호입니다.");
            }
        }

        try {
            // 사용자 객체 생성
            User user = User.builder()
                    .name(signupRequest.getName())
                    .email(signupRequest.getEmail())
                    .password(passwordEncoder.encode(signupRequest.getPassword()))
                    .phone(signupRequest.getPhone())  // 전화번호 필드 추가
                    .role(signupRequest.getRole() != null ? signupRequest.getRole() : User.Role.CUSTOMER)
                    .provider(User.AuthProvider.LOCAL)
                    .build();

            // 업체 회원인 경우 추가 정보 설정
            if (user.getRole() == User.Role.BUSINESS) {
                user.setBusinessName(signupRequest.getBusinessName());
                user.setBusinessDescription(signupRequest.getBusinessDescription());
                user.setBusinessLicense(signupRequest.getBusinessLicense());
            }

            User savedUser = userRepository.save(user);
            System.out.println("사용자 저장 성공: " + savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            System.err.println("사용자 저장 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMsec() / 1000)
                .build();
    }

    // 로그아웃 처리
    public void logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        CookieUtils.deleteRefreshTokenCookie(response);
    }
}