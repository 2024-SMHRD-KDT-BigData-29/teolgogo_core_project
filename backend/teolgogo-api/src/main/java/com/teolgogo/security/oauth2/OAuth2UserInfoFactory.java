package com.teolgogo.security.oauth2;

import com.teolgogo.exception.OAuth2AuthenticationProcessingException;
import java.util.Map;

public class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("kakao")) {
            return new KakaoOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("naver")) {
            return new NaverOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("지원하지 않는 OAuth2 제공자입니다: " + registrationId);
        }
    }
}