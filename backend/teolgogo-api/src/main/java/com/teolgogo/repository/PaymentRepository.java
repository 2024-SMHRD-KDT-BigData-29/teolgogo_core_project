package com.teolgogo.repository;

import com.teolgogo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // 사용자별 결제 내역 조회
    List<Payment> findByCustomerId(Long customerId);

    // 업체별 결제 내역 조회
    List<Payment> findByBusinessId(Long businessId);

    // 견적 응답별 결제 내역 조회
    Optional<Payment> findByQuoteResponseId(Long quoteResponseId);

    // 결제 상태별 조회
    List<Payment> findByStatus(Payment.PaymentStatus status);

    // 결제 수단별 조회
    List<Payment> findByPaymentMethod(Payment.PaymentMethod paymentMethod);

    // 결제 키로 조회
    Optional<Payment> findByPaymentKey(String paymentKey);

    // 주문 ID로 조회
    Optional<Payment> findByOrderId(String orderId);

    // 특정 기간 내 결제 내역 조회
    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 특정 금액 이상 결제 내역 조회
    List<Payment> findByAmountGreaterThanEqual(Integer amount);
}