package com.teolgogo.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class TossPaymentClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.payment.toss.client-key}")
    private String clientKey;

    @Value("${app.payment.toss.secret-key}")
    private String secretKey;

    @Value("${app.payment.toss.success-url}")
    private String successUrl;

    @Value("${app.payment.toss.fail-url}")
    private String failUrl;

    @Value("${app.payment.toss.api-url:https://api.tosspayments.com/v1}")
    private String apiUrl;

    public TossPaymentClient(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * 결제 준비 (결제창 URL 생성)
     */
    public Map<String, Object> preparePayment(String orderId, Integer amount, String orderName, String customerName, String customerEmail) {
        HttpHeaders headers = createHeaders();

        Map<String, Object> request = new HashMap<>();
        request.put("amount", amount);
        request.put("orderId", orderId);
        request.put("orderName", orderName);
        request.put("customerName", customerName);
        request.put("customerEmail", customerEmail);
        request.put("successUrl", successUrl + "?orderId=" + orderId);
        request.put("failUrl", failUrl + "?orderId=" + orderId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<HashMap> response = restTemplate.exchange(
                    apiUrl + "/payments/key-in",
                    HttpMethod.POST,
                    entity,
                    HashMap.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 준비 실패: {}", e.getMessage());
            throw new RuntimeException("결제 준비에 실패했습니다.", e);
        }
    }

    /**
     * 결제 승인
     */
    public Map<String, Object> confirmPayment(String paymentKey, String orderId, Integer amount) {
        HttpHeaders headers = createHeaders();

        Map<String, Object> request = new HashMap<>();
        request.put("paymentKey", paymentKey);
        request.put("orderId", orderId);
        request.put("amount", amount);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<HashMap> response = restTemplate.exchange(
                    apiUrl + "/payments/confirm",
                    HttpMethod.POST,
                    entity,
                    HashMap.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 승인 실패: {}", e.getMessage());
            throw new RuntimeException("결제 승인에 실패했습니다.", e);
        }
    }

    /**
     * 결제 정보 조회
     */
    public Map<String, Object> getPaymentInfo(String paymentKey) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<HashMap> response = restTemplate.exchange(
                    apiUrl + "/payments/" + paymentKey,
                    HttpMethod.GET,
                    entity,
                    HashMap.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("결제 정보 조회에 실패했습니다.", e);
        }
    }

    /**
     * 결제 취소
     */
    public Map<String, Object> cancelPayment(String paymentKey, String cancelReason) {
        HttpHeaders headers = createHeaders();

        Map<String, Object> request = new HashMap<>();
        request.put("cancelReason", cancelReason);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<HashMap> response = restTemplate.exchange(
                    apiUrl + "/payments/" + paymentKey + "/cancel",
                    HttpMethod.POST,
                    entity,
                    HashMap.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("토스페이먼츠 결제 취소 실패: {}", e.getMessage());
            throw new RuntimeException("결제 취소에 실패했습니다.", e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + auth);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * 객체를 JSON 문자열로 변환
     */
    private String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 실패", e);
        }
    }
}