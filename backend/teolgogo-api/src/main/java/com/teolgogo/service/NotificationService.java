package com.teolgogo.service;

import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.QuoteResponse;
import com.teolgogo.entity.User;
import com.teolgogo.repository.QuoteRequestRepository;
import com.teolgogo.repository.QuoteResponseRepository;
import com.teolgogo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final UserRepository userRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final KakaoPushService kakaoPushService;

    @Autowired
    public NotificationService(
            UserRepository userRepository,
            QuoteRequestRepository quoteRequestRepository,
            QuoteResponseRepository quoteResponseRepository,
            KakaoPushService kakaoPushService) {
        this.userRepository = userRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.kakaoPushService = kakaoPushService;
    }

    /**
     * 견적 요청 알림 전송 (주변 업체에게)
     */
    @Transactional(readOnly = true)
    public void sendQuoteRequestNotification(Long requestId) {
        try {
            Optional<QuoteRequest> requestOpt = quoteRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                logger.warn("견적 요청 알림 실패: 요청 ID {} 를 찾을 수 없음", requestId);
                return;
            }

            QuoteRequest request = requestOpt.get();
            User customer = request.getCustomer();

            // 주변 업체에 푸시 알림 전송
            String title = "새로운 견적 요청이 있습니다";
            String content = String.format(
                    "%s님의 %s 견적 요청이 도착했습니다. 지금 확인해보세요.",
                    customer.getName(),
                    request.getServiceType().getDisplayName()
            );
            String linkUrl = "https://teolgogo.com/business/quotation/" + requestId;

            int sentCount = kakaoPushService.sendNearbyBusinessPushNotification(
                    request.getLatitude(),
                    request.getLongitude(),
                    5.0, // 5km 반경
                    title,
                    content,
                    linkUrl
            );

            logger.info("견적 요청 알림 전송 완료: {}개 업체에 전송 (requestId: {})", sentCount, requestId);
        } catch (Exception e) {
            logger.error("견적 요청 알림 전송 중 오류 발생: ", e);
        }
    }

    /**
     * 견적 제안 알림 전송 (고객에게)
     */
    @Transactional(readOnly = true)
    public void sendQuoteOfferNotification(Long offerId) {
        try {
            Optional<QuoteResponse> offerOpt = quoteResponseRepository.findById(offerId);
            if (offerOpt.isEmpty()) {
                logger.warn("견적 제안 알림 실패: 제안 ID {} 를 찾을 수 없음", offerId);
                return;
            }

            QuoteResponse offer = offerOpt.get();
            User business = offer.getBusiness();
            User customer = offer.getQuoteRequest().getCustomer();

            // 고객에게 푸시 알림 전송
            String title = "견적 제안이 도착했습니다";
            String content = String.format(
                    "%s 업체에서 %s원의 견적을 제안했습니다. 지금 확인해보세요.",
                    business.getBusinessName(),
                    offer.getPrice().toString()
            );
            String linkUrl = "https://teolgogo.com/quotation/" + offer.getQuoteRequest().getId();

            boolean sent = kakaoPushService.sendPushNotification(
                    customer.getId(),
                    title,
                    content,
                    linkUrl
            );

            logger.info("견적 제안 알림 전송 {}: 고객(ID: {})에게 알림 (offerId: {})",
                    sent ? "성공" : "실패", customer.getId(), offerId);
        } catch (Exception e) {
            logger.error("견적 제안 알림 전송 중 오류 발생: ", e);
        }
    }

    /**
     * 견적 수락 알림 전송 (업체에게)
     */
    @Transactional(readOnly = true)
    public void sendQuoteAcceptNotification(Long offerId) {
        try {
            Optional<QuoteResponse> offerOpt = quoteResponseRepository.findById(offerId);
            if (offerOpt.isEmpty()) {
                logger.warn("견적 수락 알림 실패: 제안 ID {} 를 찾을 수 없음", offerId);
                return;
            }

            QuoteResponse offer = offerOpt.get();
            User business = offer.getBusiness();
            User customer = offer.getQuoteRequest().getCustomer();

            // 업체에게 푸시 알림 전송
            String title = "견적이 수락되었습니다";
            String content = String.format(
                    "%s님이 귀하의 견적 제안을 수락했습니다. 지금 확인해보세요.",
                    customer.getName()
            );
            String linkUrl = "https://teolgogo.com/business/quotation/" + offer.getId() + "/dashboard";

            boolean sent = kakaoPushService.sendPushNotification(
                    business.getId(),
                    title,
                    content,
                    linkUrl
            );

            logger.info("견적 수락 알림 전송 {}: 업체(ID: {})에게 알림 (offerId: {})",
                    sent ? "성공" : "실패", business.getId(), offerId);
        } catch (Exception e) {
            logger.error("견적 수락 알림 전송 중 오류 발생: ", e);
        }
    }

    /**
     * 미용 완료 알림 전송 (고객에게)
     */
    @Transactional(readOnly = true)
    public void sendGroomingCompletedNotification(Long responseId) {
        try {
            Optional<QuoteResponse> responseOpt = quoteResponseRepository.findById(responseId);
            if (responseOpt.isEmpty()) {
                logger.warn("미용 완료 알림 실패: 응답 ID {} 를 찾을 수 없음", responseId);
                return;
            }

            QuoteResponse response = responseOpt.get();
            User business = response.getBusiness();
            User customer = response.getQuoteRequest().getCustomer();

            // 고객에게 푸시 알림 전송
            String title = "반려동물 미용이 완료되었습니다";
            String content = String.format(
                    "%s 업체에서 반려동물 미용이 완료되었다는 알림을 보냈습니다. 미용 전/후 사진을 확인해보세요.",
                    business.getBusinessName()
            );
            String linkUrl = "https://teolgogo.com/reviews/create/" + responseId;

            boolean sent = kakaoPushService.sendPushNotification(
                    customer.getId(),
                    title,
                    content,
                    linkUrl
            );

            logger.info("미용 완료 알림 전송 {}: 고객(ID: {})에게 알림 (responseId: {})",
                    sent ? "성공" : "실패", customer.getId(), responseId);
        } catch (Exception e) {
            logger.error("미용 완료 알림 전송 중 오류 발생: ", e);
        }
    }

    /**
     * 새 리뷰 알림 전송 (업체에게)
     */
    @Transactional(readOnly = true)
    public void sendNewReviewNotification(Long reviewId, Long businessId, String customerName, Integer rating) {
        try {
            // 업체에게 푸시 알림 전송
            String title = "새로운 리뷰가 등록되었습니다";
            String content = String.format(
                    "%s님이 %d점의 리뷰를 남겼습니다. 지금 확인해보세요.",
                    customerName,
                    rating
            );
            String linkUrl = "https://teolgogo.com/business/reviews";

            boolean sent = kakaoPushService.sendPushNotification(
                    businessId,
                    title,
                    content,
                    linkUrl
            );

            logger.info("새 리뷰 알림 전송 {}: 업체(ID: {})에게 알림 (reviewId: {})",
                    sent ? "성공" : "실패", businessId, reviewId);
        } catch (Exception e) {
            logger.error("새 리뷰 알림 전송 중 오류 발생: ", e);
        }
    }

    /**
     * 호환성을 위한 메소드 (기존 코드에서 이 이름으로 호출하는 경우)
     */
    @Transactional(readOnly = true)
    public void sendReviewNotification(Long reviewId) {
        try {
            // ReviewService에서 사용하는 메소드 호환성 유지
            // 구체적인 정보 없이 호출되는 경우 로그만 남김
            logger.info("리뷰 알림 요청 (reviewId: {}). sendNewReviewNotification() 메소드를 사용하세요.", reviewId);
        } catch (Exception e) {
            logger.error("리뷰 알림 전송 중 오류 발생: ", e);
        }
    }
}