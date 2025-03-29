package com.teolgogo.repository;

import com.teolgogo.entity.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {

    // 고객 ID로 견적 요청 목록 조회
    List<QuoteRequest> findByCustomerId(Long customerId);

    // 상태별 견적 요청 목록 조회
    List<QuoteRequest> findByStatus(QuoteRequest.RequestStatus status);

    // 상태 및 위치 기반 견적 요청 필터링 (반경 내 검색)
    @Query(value =
            "SELECT qr.* FROM quote_requests qr " +
                    "WHERE qr.status = :status " +
                    "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(qr.latitude)) * " +
                    "cos(radians(qr.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(qr.latitude)))) <= :radius " +
                    "ORDER BY qr.created_at DESC",
            nativeQuery = true)
    List<QuoteRequest> findByStatusAndLocation(
            @Param("status") QuoteRequest.RequestStatus status,
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius);

    // 고객 ID와 상태로 견적 요청 목록 조회
    List<QuoteRequest> findByCustomerIdAndStatus(Long customerId, QuoteRequest.RequestStatus status);

    // 반려동물 유형별 견적 요청 조회
    List<QuoteRequest> findByPetType(QuoteRequest.PetType petType);

    // 서비스 유형별 견적 요청 조회
    List<QuoteRequest> findByServiceType(QuoteRequest.ServiceType serviceType);

    // 특정 날짜 이후의 견적 요청 조회
    @Query("SELECT qr FROM QuoteRequest qr WHERE qr.createdAt >= :date")
    List<QuoteRequest> findRequestsAfterDate(@Param("date") java.time.LocalDateTime date);

    // 지정된 반경 내의 모든 견적 요청 조회 (상태 무관)
    @Query(value =
            "SELECT qr.* FROM quote_requests qr " +
                    "WHERE (6371 * acos(cos(radians(:latitude)) * cos(radians(qr.latitude)) * " +
                    "cos(radians(qr.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(qr.latitude)))) <= :radius " +
                    "ORDER BY qr.created_at DESC",
            nativeQuery = true)
    List<QuoteRequest> findAllByLocation(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius);
}