package com.teolgogo.dto;

import com.teolgogo.entity.QuoteResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponseDTO {
    private Long id;
    private Long quoteRequestId;
    private Long businessId;
    private String businessName;

    @NotNull(message = "가격은 필수입니다.")
    @Min(value = 1000, message = "가격은 최소 1,000원 이상이어야 합니다.")
    private Integer price;

    @NotBlank(message = "설명은 필수입니다.")
    private String description;

    @NotBlank(message = "예상 소요 시간은 필수입니다.")
    private String estimatedTime;

    private QuoteResponse.ResponseStatus status;
    private LocalDateTime availableDate;
    private LocalDateTime createdAt;

    // 추가 정보 (비즈니스 프로필 관련)
    private String businessPhone;
    private String businessAddress;
    private String businessProfileImage;

    public static QuoteResponseDTO fromEntity(QuoteResponse response) {
        return QuoteResponseDTO.builder()
                .id(response.getId())
                .quoteRequestId(response.getQuoteRequest() != null ? response.getQuoteRequest().getId() : null)
                .businessId(response.getBusiness() != null ? response.getBusiness().getId() : null)
                .businessName(response.getBusiness() != null ?
                        response.getBusiness().getBusinessName() != null ?
                                response.getBusiness().getBusinessName() :
                                response.getBusiness().getName() : null)
                .price(response.getPrice())
                .description(response.getDescription())
                .estimatedTime(response.getEstimatedTime())
                .status(response.getStatus())
                .availableDate(response.getAvailableDate())
                .createdAt(response.getCreatedAt())
                .businessPhone(response.getBusiness() != null ? response.getBusiness().getPhone() : null)
                .businessAddress(response.getBusiness() != null ? response.getBusiness().getAddress() : null)
                .businessProfileImage(response.getBusiness() != null ? response.getBusiness().getProfileImage() : null)
                .build();
    }
}