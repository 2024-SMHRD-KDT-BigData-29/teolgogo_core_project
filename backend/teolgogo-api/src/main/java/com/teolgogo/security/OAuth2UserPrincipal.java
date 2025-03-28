package com.teolgogo.security;

import com.teolgogo.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class OAuth2UserPrincipal implements OAuth2User {
    private User user;
    private Map<String, Object> attributes;
    private Collection<? extends GrantedAuthority> authorities;

    public OAuth2UserPrincipal(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    public static OAuth2UserPrincipal create(User user, Map<String, Object> attributes) {
        return new OAuth2UserPrincipal(user, attributes);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return user.getId().toString();
    }

    public User getUser() {
        return user;
    }
}