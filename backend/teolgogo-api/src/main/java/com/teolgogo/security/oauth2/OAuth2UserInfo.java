package com.teolgogo.security.oauth2;

import java.util.Map;

public interface OAuth2UserInfo {
    String getId();
    String getName();
    String getEmail();
    String getImageUrl();
    Map<String, Object> getAttributes();
}