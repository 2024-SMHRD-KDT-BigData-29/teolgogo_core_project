package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "quote_requests")
public class QuoteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Enumerated(EnumType.STRING)
    private PetType petType; // DOG, CAT, OTHER

    private String petBreed; // 견종 또는 묘종
    private Integer petAge; // 반려동물 나이
    private Double petWeight; // 체중(kg)

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType; // BASIC, SPECIAL, BATH, STYLING

    @Column(columnDefinition = "TEXT")
    private String description; // 요청사항

    private Double latitude; // 위도
    private Double longitude; // 경도
    private String address; // 주소

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, OFFERED, ACCEPTED, COMPLETED, CANCELLED

    // 리뷰 상태 추가
    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus; // NOT_REVIEWED, REVIEWED

    private LocalDateTime preferredDate; // 선호하는 날짜
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quoteRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteResponse> responses = new ArrayList<>();

    @OneToMany(mappedBy = "quoteRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteItem> items = new ArrayList<>();

    // 반려동물 사진 관련 필드 추가
    @OneToMany(mappedBy = "quoteRequestId", cascade = CascadeType.ALL)
    private List<FileEntity> petPhotos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = RequestStatus.PENDING;
        }
        if (reviewStatus == null) {
            reviewStatus = ReviewStatus.NOT_REVIEWED;
        }
    }

    public enum PetType {
        DOG, CAT, OTHER
    }

    public enum ServiceType {
        BASIC("기본 미용"),
        SPECIAL("스페셜 케어"),
        BATH("목욕/위생"),
        STYLING("스타일링");

        private final String displayName;

        ServiceType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum RequestStatus {
        PENDING, OFFERED, ACCEPTED, COMPLETED, CANCELLED
    }

    public enum ReviewStatus {
        NOT_REVIEWED, REVIEWED
    }
}