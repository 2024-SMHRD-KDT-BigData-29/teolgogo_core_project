package com.teolgogo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teolgogo.entity.PushSubscription;
import com.teolgogo.entity.User;
import com.teolgogo.repository.PushSubscriptionRepository;
import com.teolgogo.repository.UserRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import java.util.concurrent.ExecutionException;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);
    private static final ExecutorService executorService = Executors.newFixedThreadPool(5);

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private PushService pushService;

    @Value("${app.web-push.public-key}")
    private String publicKey;

    @Value("${app.web-push.private-key}")
    private String privateKey;

    @Value("${app.web-push.subject}")
    private String subject;

    @Autowired
    public PushNotificationService(
            PushSubscriptionRepository pushSubscriptionRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    private void init() {
        // BouncyCastle 보안 제공자 등록
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        try {
            // 푸시 서비스 초기화
            pushService = new PushService();
            pushService.setPublicKey(publicKey);
            pushService.setPrivateKey(privateKey);
            pushService.setSubject(subject);
            logger.info("웹 푸시 서비스 초기화 성공");
        } catch (Exception e) {
            logger.error("웹 푸시 서비스 초기화 실패", e);
        }
    }

    /**
     * 사용자의 푸시 알림 구독 정보 저장
     */
    @Transactional
    public PushSubscription saveSubscription(Long userId, Map<String, Object> subscriptionData) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new IllegalArgumentException("유효하지 않은 사용자 ID: " + userId);
            }

            User user = userOpt.get();
            Map<String, Object> keys = (Map<String, Object>) subscriptionData.get("keys");
            String endpoint = (String) subscriptionData.get("endpoint");
            String p256dhKey = (String) keys.get("p256dh");
            String authKey = (String) keys.get("auth");
            Long expirationTime = subscriptionData.get("expirationTime") != null ?
                    Long.valueOf(subscriptionData.get("expirationTime").toString()) : null;

            // 기존 구독 정보 확인
            Optional<PushSubscription> existingSubscription =
                    pushSubscriptionRepository.findByUserIdAndEndpoint(userId, endpoint);

            PushSubscription subscription;
            if (existingSubscription.isPresent()) {
                // 기존 구독 정보 업데이트
                subscription = existingSubscription.get();
                subscription.setP256dhKey(p256dhKey);
                subscription.setAuthKey(authKey);
                subscription.setExpirationTime(expirationTime);
            } else {
                // 새 구독 정보 생성
                subscription = PushSubscription.builder()
                        .user(user)
                        .endpoint(endpoint)
                        .p256dhKey(p256dhKey)
                        .authKey(authKey)
                        .expirationTime(expirationTime)
                        .build();
            }

            return pushSubscriptionRepository.save(subscription);
        } catch (Exception e) {
            logger.error("푸시 알림 구독 저장 실패", e);
            throw new RuntimeException("푸시 알림 구독 처리 중 오류 발생", e);
        }
    }

    /**
     * 사용자의 푸시 알림 구독 취소
     */
    @Transactional
    public void deleteSubscription(Long userId, String endpoint) {
        try {
            Optional<PushSubscription> subscriptionOpt =
                    pushSubscriptionRepository.findByUserIdAndEndpoint(userId, endpoint);

            subscriptionOpt.ifPresent(pushSubscriptionRepository::delete);
        } catch (Exception e) {
            logger.error("푸시 알림 구독 취소 실패", e);
            throw new RuntimeException("푸시 알림 구독 취소 중 오류 발생", e);
        }
    }

    /**
     * 단일 사용자에게 푸시 알림 전송
     */
    public boolean sendPushNotification(Long userId, String title, String body, String url) {
        try {
            List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(userId);
            if (subscriptions.isEmpty()) {
                logger.warn("푸시 알림 전송 실패: 사용자({})의 구독 정보 없음", userId);
                return false;
            }

            Map<String, Object> payload = createPayload(title, body, url);
            String payloadJson = objectMapper.writeValueAsString(payload);
            boolean sentToAtLeastOne = false;

            for (PushSubscription subscription : subscriptions) {
                try {
                    sendNotificationAsync(subscription, payloadJson);
                    sentToAtLeastOne = true;
                } catch (Exception e) {
                    logger.error("푸시 알림 전송 실패: 사용자({}), 엔드포인트: {}", userId, subscription.getEndpoint(), e);
                }
            }

            return sentToAtLeastOne;
        } catch (Exception e) {
            logger.error("푸시 알림 전송 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 여러 사용자에게 푸시 알림 전송
     */
    public int sendBulkPushNotification(List<Long> userIds, String title, String body, String url) {
        int successCount = 0;
        for (Long userId : userIds) {
            if (sendPushNotification(userId, title, body, url)) {
                successCount++;
            }
        }
        return successCount;
    }

    /**
     * 주변 업체에게 푸시 알림 전송
     */
    public int sendNearbyBusinessPushNotification(
            Double latitude, Double longitude, Double radius,
            String title, String body, String url) {
        try {
            // 주변 업체 구독 정보 조회
            List<PushSubscription> subscriptions =
                    pushSubscriptionRepository.findNearbyBusinessSubscriptions(latitude, longitude, radius);

            if (subscriptions.isEmpty()) {
                logger.warn("주변 업체 푸시 알림 전송 실패: 구독 정보 없음. 위치: {}, {}, 반경: {}km",
                        latitude, longitude, radius);
                return 0;
            }

            Map<String, Object> payload = createPayload(title, body, url);
            String payloadJson = objectMapper.writeValueAsString(payload);
            int successCount = 0;

            for (PushSubscription subscription : subscriptions) {
                try {
                    sendNotificationAsync(subscription, payloadJson);
                    successCount++;
                } catch (Exception e) {
                    logger.error("주변 업체 푸시 알림 전송 실패: 엔드포인트: {}", subscription.getEndpoint(), e);
                }
            }

            return successCount;
        } catch (Exception e) {
            logger.error("주변 업체 푸시 알림 전송 중 오류 발생", e);
            return 0;
        }
    }

    /**
     * 알림 페이로드 생성
     */
    private Map<String, Object> createPayload(String title, String body, String url) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("body", body);
        payload.put("icon", "/icons/icon-192x192.png");
        payload.put("badge", "/icons/icon-72x72.png");

        if (url != null && !url.isEmpty()) {
            payload.put("url", url);
        }

        payload.put("timestamp", System.currentTimeMillis());
        return payload;
    }

    /**
     * 비동기로 알림 전송
     */
    private void sendNotificationAsync(PushSubscription subscription, String payload) {
        executorService.submit(() -> {
            try {
                Subscription webPushSubscription = new Subscription(
                        subscription.getEndpoint(),
                        new Subscription.Keys(subscription.getP256dhKey(), subscription.getAuthKey())
                );

                Notification notification = new Notification(webPushSubscription, payload);

                try {
                    pushService.send(notification);
                    logger.debug("푸시 알림 전송 성공: 엔드포인트 {}", subscription.getEndpoint());
                } catch (ExecutionException e) {
                    // ExecutionException 처리
                    logger.error("푸시 알림 전송 중 실행 오류: 엔드포인트 {}, 메시지: {}",
                            subscription.getEndpoint(), e.getMessage(), e);

                    // 구독이 만료되었거나 유효하지 않은 경우 삭제 처리
                    if (isSubscriptionExpired(e)) {
                        logger.info("만료된 구독 삭제: {}", subscription.getEndpoint());
                        pushSubscriptionRepository.delete(subscription);
                    }
                } catch (GeneralSecurityException | IOException | JoseException | InterruptedException e) {
                    logger.error("푸시 알림 전송 중 오류 발생: 엔드포인트 {}", subscription.getEndpoint(), e);

                    // 구독이 만료되었거나 유효하지 않은 경우 삭제
                    if (isSubscriptionExpired(e)) {
                        logger.info("만료된 구독 삭제: {}", subscription.getEndpoint());
                        pushSubscriptionRepository.delete(subscription);
                    }
                }
            } catch (Exception e) {
                logger.error("푸시 알림 처리 중 예상치 못한 오류 발생: 엔드포인트 {}",
                        subscription.getEndpoint(), e);
            }
        });
    }

    /**
     * 구독 만료 여부 확인
     */
    private boolean isSubscriptionExpired(Exception e) {
        String errorMessage = e.getMessage();
        return errorMessage != null && (
                errorMessage.contains("410 Gone") ||
                        errorMessage.contains("404 Not Found") ||
                        errorMessage.contains("unsubscribed") ||
                        errorMessage.contains("expired"));
    }

    /**
     * 공개 키 조회 (프론트엔드에서 사용)
     */
    public String getPublicKey() {
        return publicKey;
    }
}