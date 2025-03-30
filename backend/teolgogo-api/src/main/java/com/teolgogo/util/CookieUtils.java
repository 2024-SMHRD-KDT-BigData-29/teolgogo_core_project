package com.teolgogo.util;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Base64;
import java.util.Optional;

@Component
public class CookieUtils {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    /**
     * 요청에서 특정 이름의 쿠키를 가져오는 메서드
     */
    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }

        return Optional.empty();
    }

    /**
     * 응답에 쿠키를 추가하는 메서드
     */
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    /**
     * 응답에 보안 쿠키를 추가하는 메서드 (SameSite 속성 포함)
     */
    public static void addSecureCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")  // CSRF 방지를 위한 SameSite 설정
                .maxAge(maxAge)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * 쿠키를 삭제하는 메서드
     */
    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                    break;
                }
            }
        }
    }

    /**
     * 보안 쿠키를 삭제하는 메서드
     */
    public static void deleteSecureCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * 객체를 직렬화하여 쿠키 값으로 변환하는 메서드
     */
    public static String serialize(Object object) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(object));
    }

    /**
     * 쿠키 값을 역직렬화하여 객체로 변환하는 메서드
     */
    public static <T> T deserialize(Cookie cookie, Class<T> cls) {
        return cls.cast(SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(cookie.getValue())));
    }

    /**
     * 문자열 값을 역직렬화하여 객체로 변환하는 메서드
     */
    public static <T> T deserialize(String value, Class<T> cls) {
        return cls.cast(SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(value)));
    }

    /**
     * 리프레시 토큰을 위한 쿠키 생성
     */
    public static void addRefreshTokenCookie(HttpServletResponse response, String token, int maxAge) {
        Cookie cookie = new Cookie("refresh_token", token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);

        // 개발/운영 환경에 따라 설정 분기
        // application.properties나 application.yml에서 설정한 profile을 활용
        // 이 부분은 Spring 환경에 맞게 수정해야 함
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        boolean isProduction = "prod".equals(activeProfile) || "production".equals(activeProfile);

        if (isProduction) {
            cookie.setSecure(true);
            // 현대 브라우저에서는 Set-Cookie 헤더로 SameSite 속성을 설정할 수 있음
            // 그러나 Jakarta Servlet API에서는 직접 지원하지 않으므로 헤더를 직접 설정
            response.addHeader("Set-Cookie", String.format("%s=%s; Path=%s; Max-Age=%d; HttpOnly; Secure; SameSite=None",
                    cookie.getName(), cookie.getValue(), cookie.getPath(), cookie.getMaxAge()));
        } else {
            response.addCookie(cookie);
        }
    }

    /**
     * 리프레시 토큰 쿠키 삭제
     */
    public void deleteRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }
}