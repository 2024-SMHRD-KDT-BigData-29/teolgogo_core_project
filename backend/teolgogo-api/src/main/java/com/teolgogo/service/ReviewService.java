package com.teolgogo.service;

import com.teolgogo.entity.QuoteResponse;
import com.teolgogo.entity.Review;
import com.teolgogo.entity.User;
import com.teolgogo.repository.QuoteResponseRepository;
import com.teolgogo.repository.ReviewRepository;
import com.teolgogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

import com.teolgogo.entity.QuoteRequest;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public ReviewService(
            ReviewRepository reviewRepository,
            QuoteResponseRepository quoteResponseRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * 리뷰 작성
     */
    @Transactional
    public Review createReview(Long customerId, Long quoteResponseId, Integer rating, String content, List<String> tags) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        QuoteResponse quoteResponse = quoteResponseRepository.findById(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        User business = quoteResponse.getBusiness();

        // 이미 리뷰가 있는지 확인
        Optional<Review> existingReview = reviewRepository.findByQuoteResponseId(quoteResponseId);
        if (existingReview.isPresent()) {
            throw new IllegalStateException("이미 리뷰를 작성했습니다.");
        }

        // 자신의 견적 요청인지 확인
        if (!quoteResponse.getQuoteRequest().getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("리뷰를 작성할 권한이 없습니다.");
        }

        // 평점 유효성 검사
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1-5 사이여야 합니다.");
        }

        // 리뷰 생성
        Review review = Review.builder()
                .customer(customer)
                .business(business)
                .quoteResponse(quoteResponse)
                .rating(rating)
                .content(content)
                .tags(tags)
                .isPublic(true)
                .build();

        Review savedReview = reviewRepository.save(review);

        // 업체의 평균 평점 업데이트
        updateBusinessAverageRating(business.getId());

        // 업체에게 리뷰 알림 전송 - 수정된 부분
        // 기존: notificationService.sendReviewNotification(savedReview.getId());

        // 옵션 1: 호환성을 위해 유지된 sendReviewNotification 메소드 사용
        notificationService.sendReviewNotification(savedReview.getId());

        /* 옵션 2: 새로운 상세 알림 메소드 사용 (선택적 적용)
        notificationService.sendNewReviewNotification(
            savedReview.getId(),
            business.getId(),
            customer.getName(),
            rating
        );
        */

        return savedReview;
    }

    /**
     * 리뷰 수정
     */
    @Transactional
    public Review updateReview(Long customerId, Long reviewId, Integer rating, String content, List<String> tags) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        // 자신의 리뷰인지 확인
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("리뷰를 수정할 권한이 없습니다.");
        }

        // 평점 유효성 검사
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1-5 사이여야 합니다.");
        }

        // 리뷰 업데이트
        review.setRating(rating);
        review.setContent(content);
        review.setTags(tags);

        Review updatedReview = reviewRepository.save(review);

        // 업체의 평균 평점 업데이트
        updateBusinessAverageRating(review.getBusiness().getId());

        return updatedReview;
    }

    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long customerId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        // 자신의 리뷰인지 확인
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("리뷰를 삭제할 권한이 없습니다.");
        }

        Long businessId = review.getBusiness().getId();

        reviewRepository.delete(review);

        // 업체의 평균 평점 업데이트
        updateBusinessAverageRating(businessId);
    }

    /**
     * 리뷰 상세 조회
     */
    public Review getReviewDetails(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));
    }

    /**
     * 견적 응답에 연결된 리뷰 조회
     */
    public Review getReviewByQuoteResponse(Long quoteResponseId) {
        return reviewRepository.findByQuoteResponseId(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));
    }

    /**
     * 고객별 작성한 리뷰 목록 조회
     */
    public List<Review> getCustomerReviews(Long customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }

    /**
     * 업체별 받은 리뷰 목록 조회
     */
    public List<Review> getBusinessReviews(Long businessId) {
        return reviewRepository.findByBusinessId(businessId);
    }

    /**
     * 업체별 받은 리뷰 목록 페이징 조회
     */
    public Page<Review> getBusinessReviewsPaged(Long businessId, Pageable pageable) {
        return reviewRepository.findByBusinessId(businessId, pageable);
    }

    /**
     * 업체의 평균 평점 조회
     */
    public Double getBusinessAverageRating(Long businessId) {
        return reviewRepository.calculateAverageRatingByBusinessId(businessId);
    }

    /**
     * 업체의 평균 평점 업데이트
     */
    @Transactional
    public void updateBusinessAverageRating(Long businessId) {
        Double averageRating = reviewRepository.calculateAverageRatingByBusinessId(businessId);

        User business = userRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("업체를 찾을 수 없습니다."));

        // TODO: User 엔티티에 averageRating 필드 추가 필요
        // business.setAverageRating(averageRating);
        // userRepository.save(business);
    }

    /**
     * 태그로 리뷰 검색
     */
    public List<Review> getReviewsByTag(String tag) {
        return reviewRepository.findByTag(tag);
    }

    /**
     * 업체별 최신 리뷰 조회
     */
    public List<Review> getRecentBusinessReviews(Long businessId) {
        return reviewRepository.findTop5ByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    /**
     * 업체별 베스트 리뷰 조회
     */
    public List<Review> getBestBusinessReviews(Long businessId) {
        return reviewRepository.findTop5ByBusinessIdOrderByRatingDescCreatedAtDesc(businessId);
    }
}