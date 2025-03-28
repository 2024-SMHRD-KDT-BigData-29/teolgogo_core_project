package com.teolgogo.controller;

import com.teolgogo.entity.Payment;
import com.teolgogo.entity.User;
import com.teolgogo.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * 토스페이먼츠 결제 준비
     */
    @PostMapping("/toss/prepare")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> prepareTossPayment(
            @AuthenticationPrincipal User user,
            @RequestParam Long quoteResponseId) {

        try {
            Map<String, Object> response = paymentService.prepareTossPayment(quoteResponseId, user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 준비 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 카카오페이 결제 준비
     */
    @PostMapping("/kakao/prepare")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> prepareKakaoPayment(
            @AuthenticationPrincipal User user,
            @RequestParam Long quoteResponseId) {

        try {
            Map<String, Object> response = paymentService.prepareKakaoPayment(quoteResponseId, user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("카카오페이 결제 준비 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 토스페이먼츠 결제 승인
     */
    @PostMapping("/toss/confirm")
    public ResponseEntity<?> confirmTossPayment(
            @RequestParam String paymentKey,
            @RequestParam String orderId,
            @RequestParam Integer amount) {

        try {
            Map<String, Object> response = paymentService.confirmTossPayment(paymentKey, orderId, amount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 승인 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 카카오페이 결제 승인
     */
    @PostMapping("/kakao/confirm")
    public ResponseEntity<?> confirmKakaoPayment(
            @RequestParam String pg_token,
            @RequestParam String partner_order_id,
            @RequestParam String partner_user_id,
            @RequestParam String tid) {

        try {
            Map<String, Object> response = paymentService.confirmKakaoPayment(
                    pg_token, partner_order_id, partner_user_id, tid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("카카오페이 결제 승인 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 결제 취소
     */
    @PostMapping("/{paymentId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long paymentId,
            @RequestParam String cancelReason) {

        try {
            Map<String, Object> response = paymentService.cancelPayment(paymentId, cancelReason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결제 취소 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 고객의 결제 내역 조회
     */
    @GetMapping("/customer/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerPaymentHistory(@AuthenticationPrincipal User user) {
        List<Payment> payments = paymentService.getCustomerPayments(user.getId());
        return ResponseEntity.ok(payments);
    }

    /**
     * 업체의 결제 내역 조회
     */
    @GetMapping("/business/history")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<?> getBusinessPaymentHistory(@AuthenticationPrincipal User user) {
        List<Payment> payments = paymentService.getBusinessPayments(user.getId());
        return ResponseEntity.ok(payments);
    }

    /**
     * 결제 상세 조회
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPaymentDetails(
            @AuthenticationPrincipal User user,
            @PathVariable Long paymentId) {

        try {
            Payment payment = paymentService.getPaymentDetails(paymentId);

            // 권한 확인 (고객 또는 업체만 조회 가능)
            if (!payment.getCustomer().getId().equals(user.getId()) &&
                    !payment.getBusiness().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "접근 권한이 없습니다."));
            }

            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 견적 응답에 연결된 결제 정보 조회
     */
    @GetMapping("/by-quote-response/{quoteResponseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPaymentByQuoteResponse(
            @PathVariable Long quoteResponseId) {

        try {
            Payment payment = paymentService.getPaymentByQuoteResponse(quoteResponseId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 가상 결제 처리 (개발 및 테스트용)
     * 실제 배포 환경에서는 비활성화하거나 관리자 권한으로 제한해야 함
     */
    @PostMapping("/virtual-payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> processVirtualPayment(
            @AuthenticationPrincipal User user,
            @RequestParam Long quoteResponseId,
            @RequestParam String paymentMethod) {

        try {
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(paymentMethod);
            Payment payment = paymentService.processVirtualPayment(quoteResponseId, user.getId(), method);

            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", payment.getId());
            response.put("status", payment.getStatus());
            response.put("amount", payment.getAmount());
            response.put("paidAt", payment.getPaidAt());
            response.put("message", "가상 결제가 성공적으로 처리되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("가상 결제 처리 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}