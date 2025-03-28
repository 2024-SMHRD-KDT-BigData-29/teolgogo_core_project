package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(unique = true)
    private String phone;

    private String profileImage;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    // 위치 정보 (특히 업체에게 중요)
    private Double latitude;
    private Double longitude;
    private String address;

    // 업체 관련 추가 정보
    private String businessName;
    private String businessDescription;
    private String businessLicense;

    // 소셜 로그인 연동 여부
    private boolean kakaoLinked;
    private boolean googleLinked;
    private boolean naverLinked;

    // 푸시 알림 수신 설정
    private boolean notificationEnabled;

    // 계정 상태
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;

    // 평균 평점 (업체 회원용) - 추가된 필드
    private Double averageRating;

    // 완료된 서비스 수 (업체 회원용) - 추가된 필드
    private Integer completedServices;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> specialties = new HashSet<>(); // 예: 소형견전문, 대형견전문, 고양이전문 등

    @PrePersist
    public void prePersist() {
        if (enabled == false) {
            enabled = true;
        }
        if (accountNonExpired == false) {
            accountNonExpired = true;
        }
        if (accountNonLocked == false) {
            accountNonLocked = true;
        }
        if (credentialsNonExpired == false) {
            credentialsNonExpired = true;
        }
        if (averageRating == null) {
            averageRating = 0.0;
        }
        if (completedServices == null) {
            completedServices = 0;
        }
    }

    public enum Role {
        CUSTOMER, BUSINESS, ADMIN
    }

    public enum AuthProvider {
        LOCAL, KAKAO, GOOGLE, NAVER
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // 평균 평점 업데이트 메서드
    public void updateAverageRating(Double newAverageRating) {
        this.averageRating = newAverageRating;
    }

    // 완료된 서비스 증가 메서드
    public void incrementCompletedServices() {
        this.completedServices = (this.completedServices != null ? this.completedServices : 0) + 1;
    }
}