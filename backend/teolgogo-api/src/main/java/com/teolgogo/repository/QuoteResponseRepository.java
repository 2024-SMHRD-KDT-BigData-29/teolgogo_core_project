package com.teolgogo.repository;

import com.teolgogo.entity.QuoteResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteResponseRepository extends JpaRepository<QuoteResponse, Long> {

    // 견적 요청 ID로 모든 견적 제안 조회
    List<QuoteResponse> findByQuoteRequestId(Long quoteRequestId);

    // 업체 ID로 자신이 제안한 견적 목록 조회
    List<QuoteResponse> findByBusinessId(Long businessId);

    // 견적 요청 ID와 업체 ID로 특정 견적 제안 조회
    QuoteResponse findByQuoteRequestIdAndBusinessId(Long quoteRequestId, Long businessId);

    // 상태별 견적 제안 목록 조회
    List<QuoteResponse> findByStatus(QuoteResponse.ResponseStatus status);

    // 업체 ID와 상태로 견적 제안 목록 조회
    List<QuoteResponse> findByBusinessIdAndStatus(Long businessId, QuoteResponse.ResponseStatus status);

    // 특정 가격 범위 내의 견적 제안 조회
    @Query("SELECT qr FROM QuoteResponse qr WHERE qr.price >= :minPrice AND qr.price <= :maxPrice")
    List<QuoteResponse> findByPriceRange(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);

    // 특정 견적 요청에 대한 평균 제안 가격 조회
    @Query("SELECT AVG(qr.price) FROM QuoteResponse qr WHERE qr.quoteRequest.id = :requestId")
    Double findAveragePriceByRequestId(@Param("requestId") Long requestId);

    // 특정 견적 요청에 대한 최저 제안 가격 조회
    @Query("SELECT MIN(qr.price) FROM QuoteResponse qr WHERE qr.quoteRequest.id = :requestId")
    Integer findMinPriceByRequestId(@Param("requestId") Long requestId);

    // 특정 견적 요청에 대한 최고 제안 가격 조회
    @Query("SELECT MAX(qr.price) FROM QuoteResponse qr WHERE qr.quoteRequest.id = :requestId")
    Integer findMaxPriceByRequestId(@Param("requestId") Long requestId);

    // 특정 기간 내에 생성된 견적 제안 조회
    @Query("SELECT qr FROM QuoteResponse qr WHERE qr.createdAt BETWEEN :startDate AND :endDate")
    List<QuoteResponse> findByDateRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    // 업체별 수락된 견적 제안 수 조회
    @Query("SELECT qr.business.id, COUNT(qr) FROM QuoteResponse qr WHERE qr.status = 'ACCEPTED' GROUP BY qr.business.id")
    List<Object[]> countAcceptedQuotesByBusiness();
}