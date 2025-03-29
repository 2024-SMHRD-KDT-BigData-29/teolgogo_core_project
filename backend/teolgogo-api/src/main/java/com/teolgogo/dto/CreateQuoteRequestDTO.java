package com.teolgogo.dto;

import com.teolgogo.entity.QuoteRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuoteRequestDTO {

    @NotBlank(message = "제목은 필수 항목입니다")
    private String title;

    @NotNull(message = "반려동물 종류는 필수 항목입니다")
    private QuoteRequest.PetType petType;

    @NotBlank(message = "품종은 필수 항목입니다")
    private String petBreed;

    @NotNull(message = "나이는 필수 항목입니다")
    @Positive(message = "나이는 양수여야 합니다")
    private Integer petAge;

    @NotNull(message = "체중은 필수 항목입니다")
    @Positive(message = "체중은 양수여야 합니다")
    private Double petWeight;

    @NotNull(message = "서비스 종류는 필수 항목입니다")
    private QuoteRequest.ServiceType serviceType;

    private String description;

    private Double latitude;
    private Double longitude;
    private String address;
    private String addressDetail;

    // 사진 이용 동의 추가
    @NotNull(message = "반려동물 사진 이용 동의는 필수 항목입니다")
    private Boolean photoConsent;

    private LocalDateTime preferredDate;
    private List<QuoteItemDTO> items;
}