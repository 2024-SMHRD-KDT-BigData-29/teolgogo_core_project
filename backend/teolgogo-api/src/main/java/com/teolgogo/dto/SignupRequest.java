package com.teolgogo.dto;

import com.teolgogo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이름은 필수입니다.")
    @Size(min = 2, max = 30, message = "이름은 2자 이상 30자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "휴대폰 번호는 필수입니다.")
    @Pattern(regexp = "^\\d{10,11}$", message = "핸드폰 번호는 10~11자리 숫자여야 합니다.")
    private String phone;

    // 회원 역할 (CUSTOMER 또는 BUSINESS)
    private User.Role role;

    // 업체 회원을 위한 추가 정보
    private String businessName;
    private String businessDescription;
    private String businessLicense;

    // 약관 동의 필드 추가 (프론트엔드에서 체크하지만 백엔드에서도 검증 필요)
    private Boolean agreeTerms;
    private Boolean agreePrivacy;
}