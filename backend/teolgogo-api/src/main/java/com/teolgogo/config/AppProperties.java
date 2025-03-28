package com.teolgogo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
    private final Auth auth = new Auth();
    private final OAuth2 oauth2 = new OAuth2();

    @Getter
    @Setter
    public static class Auth {
        private String tokenSecret;
        private long tokenExpirationMsec;
        private long refreshTokenExpirationMsec;
    }

    @Getter
    @Setter
    public static class OAuth2 {
        private List<String> authorizedRedirectUris = new ArrayList<>();
    }
}