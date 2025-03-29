package com.teolgogo.service;

import com.teolgogo.entity.User;
import com.teolgogo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class KakaoPushService {

    private static final Logger logger = LoggerFactory.getLogger(KakaoPushService.class);

    @Value("${app.kakao.api-key}")
    private String kakaoApiKey;

    @Value("${app.kakao.push-notification-url}")
    private String pushNotificationUrl;

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public KakaoPushService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * 사용자에게 카카오톡 푸시알림 전송
     * @param userId 사용자 ID
     * @param title 알림 제목
     * @param content 알림 내용
     * @param linkUrl 링크 URL (선택사항)
     * @return 전송 성공 여부
     */
    public boolean sendPushNotification(Long userId, String title, String content, String linkUrl) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || !userOpt.get().isKakaoLinked()) {
                logger.warn("카카오톡 푸시알림 전송 실패: 사용자가 없거나 카카오계정 연동이 되지 않음 (userId: {})", userId);
                return false;
            }

            User user = userOpt.get();
            Map<String, Object> requestBody = createRequestBody(title, content, linkUrl);
            HttpHeaders headers = createHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    new URI(pushNotificationUrl),
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("카카오톡 푸시알림 전송 성공 (userId: {})", userId);
                return true;
            } else {
                logger.error("카카오톡 푸시알림 전송 실패: API 응답 - {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            logger.error("카카오톡 푸시알림 전송 중 오류 발생: ", e);
            return false;
        }
    }

    /**
     * 여러 사용자에게 카카오톡 푸시알림 전송
     * @param userIds 사용자 ID 목록
     * @param title 알림 제목
     * @param content 알림 내용
     * @param linkUrl 링크 URL (선택사항)
     * @return 전송 성공한 사용자 수
     */
    public int sendBulkPushNotification(List<Long> userIds, String title, String content, String linkUrl) {
        int successCount = 0;
        for (Long userId : userIds) {
            if (sendPushNotification(userId, title, content, linkUrl)) {
                successCount++;
            }
        }
        return successCount;
    }

    /**
     * 특정 위치 주변의 업체에게 푸시알림 전송
     * @param latitude 위도
     * @param longitude 경도
     * @param radius 반경 (km)
     * @param title 알림 제목
     * @param content 알림 내용
     * @param linkUrl 링크 URL (선택사항)
     * @return 전송 성공한 업체 수
     */
    public int sendNearbyBusinessPushNotification(
            Double latitude, Double longitude, Double radius,
            String title, String content, String linkUrl) {
        try {
            // 주변 업체 찾기 (User.Role.BUSINESS 열거형으로 전달)
            List<User> nearbyBusinesses = userRepository.findNearbyBusinessUsers(
                    latitude, longitude, radius, User.Role.BUSINESS);

            int successCount = 0;
            for (User business : nearbyBusinesses) {
                if (business.isKakaoLinked() && business.isNotificationEnabled()) {
                    if (sendPushNotification(business.getId(), title, content, linkUrl)) {
                        successCount++;
                    }
                }
            }
            return successCount;
        } catch (Exception e) {
            logger.error("주변 업체 푸시알림 전송 중 오류 발생: ", e);
            return 0;
        }
    }

    /**
     * 카카오톡 API 요청 헤더 생성
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);
        return headers;
    }

    /**
     * 카카오톡 API 요청 바디 생성
     */
    private Map<String, Object> createRequestBody(String title, String content, String linkUrl) {
        Map<String, Object> requestBody = new HashMap<>();

        // 템플릿 객체 생성
        Map<String, Object> template = new HashMap<>();
        Map<String, Object> templateObject = new HashMap<>();

        // 텍스트 템플릿 설정
        templateObject.put("object_type", "text");
        templateObject.put("text", content);
        templateObject.put("link", createLinkObject(linkUrl));

        if (title != null && !title.isEmpty()) {
            templateObject.put("button_title", title);
        }

        template.put("template_object", templateObject);
        requestBody.put("template_id", template);

        return requestBody;
    }

    /**
     * 링크 객체 생성
     */
    private Map<String, Object> createLinkObject(String linkUrl) {
        Map<String, Object> link = new HashMap<>();

        // 웹 링크 설정
        if (linkUrl != null && !linkUrl.isEmpty()) {
            link.put("web_url", linkUrl);
            link.put("mobile_web_url", linkUrl);
        } else {
            // 기본 링크 설정
            link.put("web_url", "https://teolgogo.com");
            link.put("mobile_web_url", "https://teolgogo.com");
        }

        return link;
    }
}