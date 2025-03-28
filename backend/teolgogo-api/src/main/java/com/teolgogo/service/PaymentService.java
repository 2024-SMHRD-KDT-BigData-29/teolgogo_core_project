package com.teolgogo.service;

import com.teolgogo.client.KakaoPayClient;
import com.teolgogo.client.TossPaymentClient;
import com.teolgogo.entity.Payment;
import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.QuoteResponse;
import com.teolgogo.entity.User;
import com.teolgogo.repository.PaymentRepository;
import com.teolgogo.repository.QuoteRequestRepository;
import com.teolgogo.repository.QuoteResponseRepository;
import com.teolgogo.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final UserRepository userRepository;
    private final TossPaymentClient tossPaymentClient;
    private final KakaoPayClient kakaoPayClient;

    @Autowired
    public PaymentService(
            PaymentRepository paymentRepository,
            QuoteResponseRepository quoteResponseRepository,
            QuoteRequestRepository quoteRequestRepository,
            UserRepository userRepository,
            TossPaymentClient tossPaymentClient,
            KakaoPayClient kakaoPayClient) {
        this.paymentRepository = paymentRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.userRepository = userRepository;
        this.tossPaymentClient = tossPaymentClient;
        this.kakaoPayClient = kakaoPayClient;
    }

    /**
     * 토스페이먼츠 결제 준비
     */
    @Transactional
    public Map<String, Object> prepareTossPayment(Long quoteResponseId, Long customerId) {
        QuoteResponse quoteResponse = quoteResponseRepository.findById(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        User business = quoteResponse.getBusiness();
        QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();

        // 이미 결제가 있는지 확인
        paymentRepository.findByQuoteResponseId(quoteResponseId).ifPresent(existingPayment -> {
            if (existingPayment.getStatus() == Payment.PaymentStatus.DONE) {
                throw new IllegalStateException("이미 결제가 완료된 견적입니다.");
            }
        });

        // 주문 ID 생성
        String orderId = "TEOLGOGO_" + UUID.randomUUID().toString().replace("-", "");

        // 상품명 생성
        String orderName = quoteRequest.getServiceType().getDisplayName() + " 서비스";

        try {
            // 토스페이먼츠 결제 준비 요청
            Map<String, Object> response = tossPaymentClient.preparePayment(
                    orderId,
                    quoteResponse.getPrice(),
                    orderName,
                    customer.getName(),
                    customer.getEmail()
            );

            // 결제 정보 저장
            Payment payment = Payment.builder()
                    .customer(customer)
                    .business(business)
                    .quoteResponse(quoteResponse)
                    .amount(quoteResponse.getPrice())
                    .paymentMethod(Payment.PaymentMethod.CARD) // 기본값, 실제 결제 시 변경될 수 있음
                    .status(Payment.PaymentStatus.READY)
                    .orderId(orderId)
                    .createdAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            return response;
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 준비 실패: {}", e.getMessage());
            throw new RuntimeException("결제 준비에 실패했습니다.", e);
        }
    }

    /**
     * 카카오페이 결제 준비
     */
    @Transactional
    public Map<String, Object> prepareKakaoPayment(Long quoteResponseId, Long customerId) {
        QuoteResponse quoteResponse = quoteResponseRepository.findById(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        User business = quoteResponse.getBusiness();
        QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();

        // 이미 결제가 있는지 확인
        paymentRepository.findByQuoteResponseId(quoteResponseId).ifPresent(existingPayment -> {
            if (existingPayment.getStatus() == Payment.PaymentStatus.DONE) {
                throw new IllegalStateException("이미 결제가 완료된 견적입니다.");
            }
        });

        // 주문 ID 생성
        String orderId = "TEOLGOGO_" + UUID.randomUUID().toString().replace("-", "");

        // 상품명 생성
        String itemName = quoteRequest.getServiceType().getDisplayName() + " 서비스";

        try {
            // 카카오페이 결제 준비 요청
            Map<String, Object> response = kakaoPayClient.preparePayment(
                    orderId,
                    customer.getId().toString(),
                    itemName,
                    1, // 수량
                    quoteResponse.getPrice()
            );

            // 결제 정보 저장
            Payment payment = Payment.builder()
                    .customer(customer)
                    .business(business)
                    .quoteResponse(quoteResponse)
                    .amount(quoteResponse.getPrice())
                    .paymentMethod(Payment.PaymentMethod.KAKAO_PAY)
                    .status(Payment.PaymentStatus.READY)
                    .orderId(orderId)
                    .paymentKey((String) response.get("tid")) // 카카오페이의 경우 tid가 paymentKey
                    .createdAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            return response;
        } catch (Exception e) {
            log.error("카카오페이 결제 준비 실패: {}", e.getMessage());
            throw new RuntimeException("결제 준비에 실패했습니다.", e);
        }
    }

    /**
     * 토스페이먼츠 결제 승인
     */
    @Transactional
    public Map<String, Object> confirmTossPayment(String paymentKey, String orderId, Integer amount) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));

        // 금액 검증
        if (!payment.getAmount().equals(amount)) {
            throw new IllegalArgumentException("결제 금액이 일치하지 않습니다.");
        }

        try {
            // 토스페이먼츠 결제 승인 요청
            Map<String, Object> response = tossPaymentClient.confirmPayment(paymentKey, orderId, amount);

            // 결제 정보 업데이트
            payment.setPaymentKey(paymentKey);
            payment.setStatus(Payment.PaymentStatus.DONE);
            payment.setPaidAt(LocalDateTime.now());
            payment.setReceiptUrl((String) response.get("receipt").toString());

            paymentRepository.save(payment);

            // 견적 상태 업데이트
            QuoteResponse quoteResponse = payment.getQuoteResponse();
            quoteResponse.setStatus(QuoteResponse.ResponseStatus.ACCEPTED);
            quoteResponseRepository.save(quoteResponse);

            QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();
            quoteRequest.setStatus(QuoteRequest.RequestStatus.ACCEPTED);
            quoteRequestRepository.save(quoteRequest);

            return response;
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 승인 실패: {}", e.getMessage());
            throw new RuntimeException("결제 승인에 실패했습니다.", e);
        }
    }

    /**
     * 카카오페이 결제 승인
     */
    @Transactional
    public Map<String, Object> confirmKakaoPayment(String pgToken, String partnerOrderId, String partnerUserId, String tid) {
        Payment payment = paymentRepository.findByOrderId(partnerOrderId)
                .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));

        try {
            // 카카오페이 결제 승인 요청
            Map<String, Object> response = kakaoPayClient.approvePayment(pgToken, partnerOrderId, partnerUserId, tid);

            // 결제 정보 업데이트
            payment.setStatus(Payment.PaymentStatus.DONE);
            payment.setPaidAt(LocalDateTime.now());

            paymentRepository.save(payment);

            // 견적 상태 업데이트
            QuoteResponse quoteResponse = payment.getQuoteResponse();
            quoteResponse.setStatus(QuoteResponse.ResponseStatus.ACCEPTED);
            quoteResponseRepository.save(quoteResponse);

            QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();
            quoteRequest.setStatus(QuoteRequest.RequestStatus.ACCEPTED);
            quoteRequestRepository.save(quoteRequest);

            return response;
        } catch (Exception e) {
            log.error("카카오페이 결제 승인 실패: {}", e.getMessage());
            throw new RuntimeException("결제 승인에 실패했습니다.", e);
        }
    }

    /**
     * 결제 취소
     */
    @Transactional
    public Map<String, Object> cancelPayment(Long paymentId, String cancelReason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));

        if (payment.getStatus() != Payment.PaymentStatus.DONE) {
            throw new IllegalStateException("결제 완료 상태가 아닌 결제는 취소할 수 없습니다.");
        }

        try {
            Map<String, Object> response = new HashMap<>();

            // 결제 수단에 따라 적절한 취소 API 호출
            if (payment.getPaymentMethod() == Payment.PaymentMethod.KAKAO_PAY) {
                response = kakaoPayClient.cancelPayment(
                        payment.getPaymentKey(),
                        payment.getAmount(),
                        0 // 취소 부가세
                );
            } else {
                // 기본적으로 토스페이먼츠 취소 API 호출
                response = tossPaymentClient.cancelPayment(payment.getPaymentKey(), cancelReason);
            }

            // 결제 상태 업데이트
            payment.setStatus(Payment.PaymentStatus.CANCELED);
            paymentRepository.save(payment);

            return response;
        } catch (Exception e) {
            log.error("결제 취소 실패: {}", e.getMessage());
            throw new RuntimeException("결제 취소에 실패했습니다.", e);
        }
    }

    /**
     * 결제 내역 조회 (고객용)
     */
    public List<Payment> getCustomerPayments(Long customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    /**
     * 결제 내역 조회 (업체용)
     */
    public List<Payment> getBusinessPayments(Long businessId) {
        return paymentRepository.findByBusinessId(businessId);
    }

    /**
     * 결제 상세 조회
     */
    public Payment getPaymentDetails(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));
    }

    /**
     * 견적 응답에 연결된 결제 정보 조회
     */
    public Payment getPaymentByQuoteResponse(Long quoteResponseId) {
        return paymentRepository.findByQuoteResponseId(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));
    }

    /**
     * 가상 결제 처리 (실제 PG 연동 없이 결제 완료 처리)
     * 개발 및 테스트 목적으로만 사용
     */
    @Transactional
    public Payment processVirtualPayment(Long quoteResponseId, Long customerId, Payment.PaymentMethod paymentMethod) {
        QuoteResponse quoteResponse = quoteResponseRepository.findById(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        User business = quoteResponse.getBusiness();

        // 이미 결제가 있는지 확인
        Payment existingPayment = paymentRepository.findByQuoteResponseId(quoteResponseId).orElse(null);

        if (existingPayment != null) {
            if (existingPayment.getStatus() == Payment.PaymentStatus.DONE) {
                throw new IllegalStateException("이미 결제가 완료된 견적입니다.");
            }

            // 기존 결제 정보 업데이트
            existingPayment.setStatus(Payment.PaymentStatus.DONE);
            existingPayment.setPaidAt(LocalDateTime.now());
            existingPayment.setPaymentMethod(paymentMethod);
            existingPayment.setPaymentKey("VIRTUAL_" + UUID.randomUUID().toString());
            existingPayment.setUpdatedAt(LocalDateTime.now());

            Payment updatedPayment = paymentRepository.save(existingPayment);

            // 견적 상태 업데이트
            updateQuoteStatus(quoteResponse);

            return updatedPayment;
        } else {
            // 새 결제 정보 생성
            String orderId = "VIRTUAL_" + UUID.randomUUID().toString();

            Payment payment = Payment.builder()
                    .customer(customer)
                    .business(business)
                    .quoteResponse(quoteResponse)
                    .amount(quoteResponse.getPrice())
                    .paymentMethod(paymentMethod)
                    .status(Payment.PaymentStatus.DONE)
                    .orderId(orderId)
                    .paymentKey("VIRTUAL_" + UUID.randomUUID().toString())
                    .paidAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Payment savedPayment = paymentRepository.save(payment);

            // 견적 상태 업데이트
            updateQuoteStatus(quoteResponse);

            return savedPayment;
        }
    }

    /**
     * 견적 상태 업데이트 (결제 완료 시)
     */
    private void updateQuoteStatus(QuoteResponse quoteResponse) {
        quoteResponse.setStatus(QuoteResponse.ResponseStatus.ACCEPTED);
        quoteResponseRepository.save(quoteResponse);

        QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();
        quoteRequest.setStatus(QuoteRequest.RequestStatus.ACCEPTED);
        quoteRequestRepository.save(quoteRequest);
    }
}