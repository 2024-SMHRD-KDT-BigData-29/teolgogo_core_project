package com.teolgogo.controller;

import com.teolgogo.entity.Review;
import com.teolgogo.entity.User;
import com.teolgogo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * 리뷰 작성
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(
            @AuthenticationPrincipal User user,
            @RequestParam Long quoteResponseId,
            @RequestParam Integer rating,
            @RequestParam String content,
            @RequestParam(required = false) List<String> tags) {

        try {
            Review review = reviewService.createReview(user.getId(), quoteResponseId, rating, content, tags);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 리뷰 수정
     */
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long reviewId,
            @RequestParam Integer rating,
            @RequestParam String content,
            @RequestParam(required = false) List<String> tags) {

        try {
            Review review = reviewService.updateReview(user.getId(), reviewId, rating, content, tags);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 리뷰 삭제
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long reviewId) {

        try {
            reviewService.deleteReview(user.getId(), reviewId);
            return ResponseEntity.ok(Map.of("message", "리뷰가 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 리뷰 상세 조회
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewDetails(@PathVariable Long reviewId) {
        try {
            Review review = reviewService.getReviewDetails(reviewId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 견적 응답에 연결된 리뷰 조회
     */
    @GetMapping("/by-quote-response/{quoteResponseId}")
    public ResponseEntity<?> getReviewByQuoteResponse(@PathVariable Long quoteResponseId) {
        try {
            Review review = reviewService.getReviewByQuoteResponse(quoteResponseId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 고객별 작성한 리뷰 목록 조회
     */
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerReviews(@AuthenticationPrincipal User user) {
        List<Review> reviews = reviewService.getCustomerReviews(user.getId());
        return ResponseEntity.ok(reviews);
    }

    /**
     * 업체별 받은 리뷰 목록 조회
     */
    @GetMapping("/business/{businessId}")
    public ResponseEntity<?> getBusinessReviews(@PathVariable Long businessId) {
        List<Review> reviews = reviewService.getBusinessReviews(businessId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 업체별 받은 리뷰 목록 페이징 조회
     */
    @GetMapping("/business/{businessId}/paged")
    public ResponseEntity<?> getBusinessReviewsPaged(
            @PathVariable Long businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Review> reviewsPage = reviewService.getBusinessReviewsPaged(businessId, pageable);

        return ResponseEntity.ok(reviewsPage);
    }

    /**
     * 업체의 평균 평점 조회
     */
    @GetMapping("/business/{businessId}/average-rating")
    public ResponseEntity<?> getBusinessAverageRating(@PathVariable Long businessId) {
        Double averageRating = reviewService.getBusinessAverageRating(businessId);

        if (averageRating == null) {
            return ResponseEntity.ok(Map.of("averageRating", 0.0));
        }

        return ResponseEntity.ok(Map.of("averageRating", averageRating));
    }

    /**
     * 태그로 리뷰 검색
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchReviewsByTag(@RequestParam String tag) {
        List<Review> reviews = reviewService.getReviewsByTag(tag);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 업체별 최신 리뷰 조회
     */
    @GetMapping("/business/{businessId}/recent")
    public ResponseEntity<?> getRecentBusinessReviews(@PathVariable Long businessId) {
        List<Review> reviews = reviewService.getRecentBusinessReviews(businessId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 업체별 베스트 리뷰 조회
     */
    @GetMapping("/business/{businessId}/best")
    public ResponseEntity<?> getBestBusinessReviews(@PathVariable Long businessId) {
        List<Review> reviews = reviewService.getBestBusinessReviews(businessId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * 리뷰 작성 가능 여부 확인
     */
    @GetMapping("/can-review")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> canReview(
            @AuthenticationPrincipal User user,
            @RequestParam Long quoteResponseId) {

        try {
            // 이미 리뷰가 있는지 확인
            try {
                reviewService.getReviewByQuoteResponse(quoteResponseId);
                return ResponseEntity.ok(Map.of("canReview", false, "reason", "이미 리뷰를 작성했습니다."));
            } catch (EntityNotFoundException e) {
                // 리뷰가 없는 경우 작성 가능
                return ResponseEntity.ok(Map.of("canReview", true));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}