package com.teolgogo.service;

import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.QuoteResponse;
import com.teolgogo.entity.Review;
import com.teolgogo.entity.User;
import com.teolgogo.repository.QuoteRequestRepository;
import com.teolgogo.repository.QuoteResponseRepository;
import com.teolgogo.repository.ReviewRepository;
import com.teolgogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class NotificationService {

    private final UserRepository userRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final ReviewRepository reviewRepository;

    // 실제 카카오톡 알림 관련 클라이언트가 필요함
    // private final KakaoNotificationClient kakaoClient;

    @Autowired
    public NotificationService(
            UserRepository userRepository,
            QuoteRequestRepository quoteRequestRepository,
            QuoteResponseRepository quoteResponseRepository,
            ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.reviewRepository = reviewRepository;
    }

    // 견적 요청 알림 (주변 업체에게)
    public void sendQuoteRequestNotification(Long requestId) {
        QuoteRequest request = quoteRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("견적 요청을 찾을 수 없습니다."));

        // 반경 내 업체 찾기 (5km)
        List<User> nearbyBusinesses = userRepository.findBusinessesNearLocation(
                request.getLatitude(), request.getLongitude(), 5.0);

        // 각 업체에 알림 전송
        for (User business : nearbyBusinesses) {
            // 향후 구현: 카카오톡 알림 전송
            sendKakaoNotification(
                    business.getPhone(),
                    "새로운 견적 요청",
                    String.format("반경 5km 내에 %s 서비스 요청이 있습니다.",
                            request.getServiceType().getDisplayName())
            );
        }
    }

    // 견적 제안 알림 (고객에게)
    public void sendQuoteOfferNotification(Long offerId) {
        QuoteResponse offer = quoteResponseRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("견적 제안을 찾을 수 없습니다."));

        QuoteRequest request = offer.getQuoteRequest();
        User customer = request.getCustomer();
        User business = offer.getBusiness();

        // 고객에게 알림 전송
        sendKakaoNotification(
                customer.getPhone(),
                "새로운 견적 제안",
                String.format("%s 업체에서 %s 원의 견적을 제안했습니다.",
                        business.getName(), offer.getPrice())
        );
    }

    // 견적 수락 알림 (업체에게)
    public void sendQuoteAcceptNotification(Long offerId) {
        QuoteResponse offer = quoteResponseRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("견적 제안을 찾을 수 없습니다."));

        QuoteRequest request = offer.getQuoteRequest();
        User customer = request.getCustomer();
        User business = offer.getBusiness();

        // 업체에게 알림 전송
        sendKakaoNotification(
                business.getPhone(),
                "견적 수락 알림",
                String.format("%s 고객님이 %s 원의 견적을 수락했습니다.",
                        customer.getName(), offer.getPrice())
        );
    }

    // 카카오톡 알림 전송 메서드 (실제 구현 필요)
    private void sendKakaoNotification(String phone, String title, String message) {
        // 실제 카카오톡 알림 API 연동 로직 구현 필요
        System.out.println("카카오톡 알림 전송: " + phone + ", " + title + ", " + message);

        // 예시: kakaoClient.sendNotification(phone, title, message);
    }

    /**
     * 리뷰 작성 알림 (업체에게)
     */
    public void sendReviewNotification(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        User business = review.getBusiness();
        User customer = review.getCustomer();

        // 업체에게 알림 전송
        sendKakaoNotification(
                business.getPhone(),
                "새로운 리뷰 알림",
                String.format("%s 고객님이 %d점의 리뷰를 남겼습니다.",
                        customer.getName(), review.getRating())
        );
    }

    /**
     * 미용 완료 알림 (고객에게)
     */
    public void sendGroomingCompletedNotification(Long responseId) {
        QuoteResponse response = quoteResponseRepository.findById(responseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        QuoteRequest request = response.getQuoteRequest();
        User customer = request.getCustomer();
        User business = response.getBusiness();

        // 고객에게 알림 전송
        sendKakaoNotification(
                customer.getPhone(),
                "미용 완료 알림",
                String.format("%s 업체의 미용 서비스가 완료되었습니다. 리뷰를 작성해주세요.",
                        business.getBusinessName() != null ? business.getBusinessName() : business.getName())
        );
    }
}