package com.teolgogo.dto;

import com.teolgogo.entity.QuoteRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

// import jakarta.validation.*;
// import javax.validation.constraints.NotBlank;
// import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuoteRequestDTO {

    @NotNull(message = "반려동물 유형은 필수입니다.")
    private QuoteRequest.PetType petType;

    private String petBreed; // 견종 또는 묘종

    private Integer petAge; // 반려동물 나이

    private Double petWeight; // 체중(kg)

    @NotNull(message = "서비스 유형은 필수입니다.")
    private QuoteRequest.ServiceType serviceType;

    @NotBlank(message = "요청사항은 필수입니다.")
    private String description; // 요청사항

    @NotNull(message = "위도는 필수입니다.")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다.")
    private Double longitude;

    @NotBlank(message = "주소는 필수입니다.")
    private String address;

    private LocalDateTime preferredDate; // 선호하는 날짜/시간

    private List<QuoteItemDTO> items; // 요청 아이템 목록

    private List<Long> petPhotoIds;
}