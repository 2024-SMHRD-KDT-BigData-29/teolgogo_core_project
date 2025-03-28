package com.teolgogo.security;

import com.teolgogo.entity.User;
import com.teolgogo.exception.OAuth2AuthenticationProcessingException;
import com.teolgogo.repository.UserRepository;
import com.teolgogo.security.oauth2.OAuth2UserInfo;
import com.teolgogo.security.oauth2.OAuth2UserInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Autowired
    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                registrationId, oAuth2User.getAttributes());

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("이메일을 찾을 수 없습니다.");
        }

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();

            // 다른 OAuth2 제공자로 이미 가입한 사용자인 경우 예외 발생
            if (!user.getProvider().equals(User.AuthProvider.valueOf(registrationId.toUpperCase()))) {
                throw new OAuth2AuthenticationProcessingException(
                        "이미 " + user.getProvider() + " 계정으로 가입되어 있습니다. " +
                                "동일한 이메일의 " + registrationId + " 계정으로 로그인할 수 없습니다.");
            }

            // 기존 사용자 정보 업데이트
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            // 신규 사용자 등록
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        return OAuth2UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        User user = User.builder()
                .name(oAuth2UserInfo.getName())
                .email(oAuth2UserInfo.getEmail())
                .profileImage(oAuth2UserInfo.getImageUrl())
                .provider(User.AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()))
                .providerId(oAuth2UserInfo.getId())
                .role(User.Role.CUSTOMER) // 소셜 로그인은 기본적으로 고객으로 등록
                .build();

        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        // 이름과 프로필 이미지만 업데이트 (이메일은 변경하지 않음)
        existingUser.setName(oAuth2UserInfo.getName());

        if (StringUtils.hasText(oAuth2UserInfo.getImageUrl())) {
            existingUser.setProfileImage(oAuth2UserInfo.getImageUrl());
        }

        return userRepository.save(existingUser);
    }
}