package com.teolgogo.security.oauth2;

import java.util.Map;

public class NaverOAuth2UserInfo implements OAuth2UserInfo {
    private Map<String, Object> attributes;

    public NaverOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getId() {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            return null;
        }
        return (String) response.get("id");
    }

    @Override
    public String getName() {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            return null;
        }
        return (String) response.get("name");
    }

    @Override
    public String getEmail() {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            return null;
        }
        return (String) response.get("email");
    }

    @Override
    public String getImageUrl() {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            return null;
        }
        return (String) response.get("profile_image");
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}