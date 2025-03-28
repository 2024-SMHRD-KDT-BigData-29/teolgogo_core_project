package com.teolgogo.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class KakaoPayClient {

    private final RestTemplate restTemplate;

    @Value("${app.payment.kakao.admin-key}")
    private String adminKey;

    @Value("${app.payment.kakao.cid}")
    private String cid;

    @Value("${app.payment.kakao.api-url:https://kapi.kakao.com}")
    private String apiUrl;

    @Value("${app.payment.kakao.approval-url}")
    private String approvalUrl;

    @Value("${app.payment.kakao.cancel-url}")
    private String cancelUrl;

    @Value("${app.payment.kakao.fail-url}")
    private String failUrl;

    public KakaoPayClient(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * 결제 준비 요청
     */
    public Map<String, Object> preparePayment(String partnerOrderId, String partnerUserId,
                                              String itemName, Integer quantity, Integer totalAmount) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "KakaoAK " + adminKey);
        headers.add("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE + ";charset=UTF-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", cid);
        params.add("partner_order_id", partnerOrderId);
        params.add("partner_user_id", partnerUserId);
        params.add("item_name", itemName);
        params.add("quantity", String.valueOf(quantity));
        params.add("total_amount", String.valueOf(totalAmount));
        params.add("tax_free_amount", "0");
        params.add("approval_url", approvalUrl + "?partner_order_id=" + partnerOrderId);
        params.add("cancel_url", cancelUrl + "?partner_order_id=" + partnerOrderId);
        params.add("fail_url", failUrl + "?partner_order_id=" + partnerOrderId);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            return restTemplate.postForObject(
                    apiUrl + "/v1/payment/ready",
                    requestEntity,
                    HashMap.class
            );
        } catch (Exception e) {
            log.error("카카오페이 결제 준비 실패: {}", e.getMessage());
            throw new RuntimeException("카카오페이 결제 준비에 실패했습니다.", e);
        }
    }

    /**
     * 결제 승인 요청
     */
    public Map<String, Object> approvePayment(String pgToken, String partnerOrderId, String partnerUserId, String tid) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "KakaoAK " + adminKey);
        headers.add("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE + ";charset=UTF-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", cid);
        params.add("tid", tid);
        params.add("partner_order_id", partnerOrderId);
        params.add("partner_user_id", partnerUserId);
        params.add("pg_token", pgToken);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            return restTemplate.postForObject(
                    apiUrl + "/v1/payment/approve",
                    requestEntity,
                    HashMap.class
            );
        } catch (Exception e) {
            log.error("카카오페이 결제 승인 실패: {}", e.getMessage());
            throw new RuntimeException("카카오페이 결제 승인에 실패했습니다.", e);
        }
    }

    /**
     * 결제 정보 조회
     */
    public Map<String, Object> getPaymentInfo(String tid) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "KakaoAK " + adminKey);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", cid);
        params.add("tid", tid);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            return restTemplate.postForObject(
                    apiUrl + "/v1/payment/order",
                    requestEntity,
                    HashMap.class
            );
        } catch (Exception e) {
            log.error("카카오페이 결제 정보 조회 실패: {}", e.getMessage());
            throw new RuntimeException("카카오페이 결제 정보 조회에 실패했습니다.", e);
        }
    }

    /**
     * 결제 취소
     */
    public Map<String, Object> cancelPayment(String tid, Integer cancelAmount, Integer cancelTaxFreeAmount) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "KakaoAK " + adminKey);
        headers.add("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE + ";charset=UTF-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("cid", cid);
        params.add("tid", tid);
        params.add("cancel_amount", String.valueOf(cancelAmount));
        params.add("cancel_tax_free_amount", String.valueOf(cancelTaxFreeAmount));

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        try {
            return restTemplate.postForObject(
                    apiUrl + "/v1/payment/cancel",
                    requestEntity,
                    HashMap.class
            );
        } catch (Exception e) {
            log.error("카카오페이 결제 취소 실패: {}", e.getMessage());
            throw new RuntimeException("카카오페이 결제 취소에 실패했습니다.", e);
        }
    }
}