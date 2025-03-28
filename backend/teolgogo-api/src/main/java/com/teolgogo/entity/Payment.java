package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private User business;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_response_id", nullable = false)
    private QuoteResponse quoteResponse;

    private Integer amount; // 결제 금액

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // 결제 수단

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // 결제 상태

    private String paymentKey; // PG사의 결제 키

    private String receiptUrl; // 영수증 URL

    private String orderId; // 주문 ID

    private LocalDateTime paidAt; // 결제 완료 시간

    private LocalDateTime createdAt; // 결제 요청 시간

    private LocalDateTime updatedAt; // 업데이트 시간

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = PaymentStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 결제 수단 enum
    public enum PaymentMethod {
        CARD, // 신용카드
        VIRTUAL_ACCOUNT, // 가상계좌
        ACCOUNT_TRANSFER, // 계좌이체
        PHONE, // 휴대폰 결제
        KAKAO_PAY, // 카카오페이
        TOSS_PAY, // 토스페이
        NAVER_PAY, // 네이버페이
        PAYCO // 페이코
    }

    // 결제 상태 enum
    public enum PaymentStatus {
        PENDING, // 결제 대기중
        READY, // 결제 준비됨
        IN_PROGRESS, // 결제 진행중
        DONE, // 결제 완료
        CANCELED, // 결제 취소
        FAILED, // 결제 실패
        EXPIRED // 결제 만료
    }
}