package com.teolgogo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessStatisticsDTO {

    private Long businessId;
    private String businessName;

    // 견적 관련 통계
    private Integer totalQuoteRequests; // 받은 견적 요청 수
    private Integer totalQuoteOffers; // 제안한 견적 수
    private Integer acceptedQuoteOffers; // 수락된 견적 수
    private Double acceptanceRate; // 견적 수락률

    // 매출 관련 통계
    private Integer totalRevenue; // 총 매출액
    private Integer averageRevenue; // 평균 매출액 (건당)
    private Map<String, Integer> revenueByMonth; // 월별 매출
    private Map<String, Integer> revenueByService; // 서비스 유형별 매출

    // 리뷰 관련 통계
    private Double averageRating; // 평균 평점
    private Integer totalReviews; // 총 리뷰 수
    private Map<Integer, Integer> ratingDistribution; // 평점 분포
    private Map<String, Integer> popularTags; // 인기 태그

    // 지역 관련 통계
    private Map<String, Integer> customersByLocation; // 지역별 고객 수

    // 시간 관련 통계
    private Map<String, Integer> requestsByDay; // 요일별 요청 수
    private Map<String, Integer> requestsByHour; // 시간대별 요청 수

    // 전환율
    private Double inquiryToOfferRate; // 견적 요청 대비 제안 비율
    private Double offerToAcceptRate; // 견적 제안 대비 수락 비율
}