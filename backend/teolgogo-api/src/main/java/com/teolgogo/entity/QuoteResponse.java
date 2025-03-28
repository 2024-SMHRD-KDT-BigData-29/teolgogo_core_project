package com.teolgogo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "quote_responses")
public class QuoteResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_request_id", nullable = false)
    private QuoteRequest quoteRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private User business;

    private Integer price; // 총 가격

    @Column(columnDefinition = "TEXT")
    private String description; // 설명

    private String estimatedTime; // 예상 소요 시간

    @Enumerated(EnumType.STRING)
    private ResponseStatus status; // PENDING, ACCEPTED, REJECTED

    // 결제 상태 추가
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // NOT_PAID, PAID, REFUNDED

    private LocalDateTime availableDate; // 가능한 날짜
    private LocalDateTime createdAt;

    // 미용 전/후 사진 관련 필드 추가
    @OneToMany(mappedBy = "quoteResponseId", cascade = CascadeType.ALL)
    @Builder.Default
    private List<FileEntity> beforePhotos = new ArrayList<>();

    @OneToMany(mappedBy = "quoteResponseId", cascade = CascadeType.ALL)
    @Builder.Default
    private List<FileEntity> afterPhotos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ResponseStatus.PENDING;
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.NOT_PAID;
        }
    }

    public enum ResponseStatus {
        PENDING, ACCEPTED, REJECTED
    }

    public enum PaymentStatus {
        NOT_PAID, PAID, REFUNDED
    }
}