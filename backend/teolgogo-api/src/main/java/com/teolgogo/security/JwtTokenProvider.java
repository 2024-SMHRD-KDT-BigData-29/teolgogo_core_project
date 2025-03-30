package com.teolgogo.security;

import com.teolgogo.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.auth.tokenSecret}")
    private String tokenSecret;

    @Value("${app.auth.tokenExpirationMsec}")
    private long tokenExpirationMsec;

    @Value("${app.auth.refreshTokenExpirationMsec}")
    private long refreshTokenExpirationMsec;

    // 안전한 JWT 키를 저장할 변수 추가
    private SecretKey jwtSecretKey;

    // 객체 생성 후 안전한 키 초기화
    @PostConstruct
    public void init() {
        // 고정된 키를 사용하는 방식으로 변경
        // 이 방식은 항상 같은 키를 사용하므로 애플리케이션이 재시작해도 토큰이 유효함
        this.jwtSecretKey = Keys.hmacShaKeyFor(tokenSecret.getBytes());
    }

    // 액세스 토큰 생성
    public String createAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + tokenExpirationMsec);

        return Jwts.builder()
                .setSubject(Long.toString(user.getId()))
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey) // SecretKey 객체 사용
                .compact();
    }

    // 액세스 토큰 생성 (Authentication 사용)
    public String createAccessToken(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return createAccessToken(user);
    }

    // 리프레시 토큰 생성
    public String createRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMsec);

        String token = Jwts.builder()
                .setSubject(Long.toString(user.getId()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey) // SecretKey 객체 사용
                .compact();

        System.out.println("리프레시 토큰 생성: " + user.getEmail() + " - " + token.substring(0, 20) + "...");
        return token;
    }

    // 토큰에서 사용자 ID 추출
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder() // 새로운 파서 빌더 API 사용
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    // 토큰 유효성 검증
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder() // 새로운 파서 빌더 API 사용
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("유효하지 않은 JWT 서명입니다.");
        } catch (MalformedJwtException ex) {
            logger.error("유효하지 않은 JWT 토큰입니다.");
        } catch (ExpiredJwtException ex) {
            logger.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException ex) {
            logger.error("지원하지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT 토큰이 비어있습니다.");
        }
        return false;
    }

    // 토큰 만료 시간 확인
    public long getExpirationTime(String token) {
        Claims claims = Jwts.parserBuilder() // 새로운 파서 빌더 API 사용
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getExpiration().getTime() - new Date().getTime();
    }

    public long getAccessTokenExpirationMsec() {
        return tokenExpirationMsec;
    }

    public long getRefreshTokenExpirationMsec() {
        return refreshTokenExpirationMsec;
    }
}