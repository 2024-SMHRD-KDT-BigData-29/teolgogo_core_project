package com.teolgogo.dto;

import com.teolgogo.entity.QuoteRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequestDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private QuoteRequest.PetType petType;
    private String petBreed;
    private Integer petAge;
    private Double petWeight;
    private QuoteRequest.ServiceType serviceType;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private QuoteRequest.RequestStatus status;
    private LocalDateTime preferredDate;
    private LocalDateTime createdAt;
    private List<QuoteItemDTO> items;
    private int offerCount; // 받은 견적 수

    public static QuoteRequestDTO fromEntity(QuoteRequest quoteRequest) {
        return QuoteRequestDTO.builder()
                .id(quoteRequest.getId())
                .customerId(quoteRequest.getCustomer().getId())
                .customerName(quoteRequest.getCustomer().getName())
                .petType(quoteRequest.getPetType())
                .petBreed(quoteRequest.getPetBreed())
                .petAge(quoteRequest.getPetAge())
                .petWeight(quoteRequest.getPetWeight())
                .serviceType(quoteRequest.getServiceType())
                .description(quoteRequest.getDescription())
                .latitude(quoteRequest.getLatitude())
                .longitude(quoteRequest.getLongitude())
                .address(quoteRequest.getAddress())
                .status(quoteRequest.getStatus())
                .preferredDate(quoteRequest.getPreferredDate())
                .createdAt(quoteRequest.getCreatedAt())
                .offerCount(quoteRequest.getResponses().size())
                .build();
    }
}