package com.teolgogo.controller;

import com.teolgogo.entity.User;
import com.teolgogo.service.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push-notifications")
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    @Autowired
    public PushNotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    /**
     * 웹 푸시 공개 키 조회
     */
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", pushNotificationService.getPublicKey()));
    }

    /**
     * 웹 푸시 알림 구독
     */
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> subscription) {

        pushNotificationService.saveSubscription(user.getId(), subscription);
        return ResponseEntity.ok(Map.of("message", "푸시 알림 구독이 완료되었습니다."));
    }

    /**
     * 웹 푸시 알림 구독 취소
     */
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> subscription) {

        String endpoint = subscription.get("endpoint");
        pushNotificationService.deleteSubscription(user.getId(), endpoint);
        return ResponseEntity.ok(Map.of("message", "푸시 알림 구독이 취소되었습니다."));
    }

    /**
     * 테스트용 푸시 알림 전송 (개발 환경에서만 사용)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestNotification(
            @AuthenticationPrincipal User user) {

        boolean sent = pushNotificationService.sendPushNotification(
                user.getId(),
                "테스트 알림",
                "이 메시지는 웹 푸시 알림 기능 테스트를 위한 것입니다.",
                "https://teolgogo.com/dashboard"
        );

        if (sent) {
            return ResponseEntity.ok(Map.of("message", "테스트 알림이 전송되었습니다."));
        } else {
            return ResponseEntity.ok(Map.of("message", "알림 전송에 실패했습니다. 브라우저 알림 권한을 확인하세요."));
        }
    }
}