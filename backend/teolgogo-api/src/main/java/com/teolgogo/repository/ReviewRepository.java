package com.teolgogo.repository;

import com.teolgogo.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 고객별 작성한 리뷰 조회
    List<Review> findByCustomerId(Long customerId);

    // 업체별 받은 리뷰 조회
    List<Review> findByBusinessId(Long businessId);
    Page<Review> findByBusinessId(Long businessId, Pageable pageable);

    // 견적 응답별 리뷰 조회
    Optional<Review> findByQuoteResponseId(Long quoteResponseId);

    // 평점별 리뷰 조회
    List<Review> findByRating(Integer rating);
    List<Review> findByBusinessIdAndRating(Long businessId, Integer rating);

    // 태그로 리뷰 검색
    @Query("SELECT r FROM Review r JOIN r.tags t WHERE t = :tag")
    List<Review> findByTag(@Param("tag") String tag);

    // 업체별 평균 평점 계산
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.business.id = :businessId")
    Double calculateAverageRatingByBusinessId(@Param("businessId") Long businessId);

    // 기간별 리뷰 조회
    List<Review> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 공개 리뷰만 조회
    List<Review> findByBusinessIdAndIsPublic(Long businessId, Boolean isPublic);

    // 내용 검색
    List<Review> findByContentContaining(String keyword);

    // 업체별 최신 리뷰 조회
    List<Review> findTop5ByBusinessIdOrderByCreatedAtDesc(Long businessId);

    // 업체별 베스트 리뷰 조회 (평점 높은 순)
    List<Review> findTop5ByBusinessIdOrderByRatingDescCreatedAtDesc(Long businessId);
}