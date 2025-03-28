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
public class ServiceStatisticsDTO {

    // 서비스 유형별 통계
    private Map<String, Integer> requestsByServiceType; // 서비스 유형별 요청 수
    private Map<String, Double> averagePriceByServiceType; // 서비스 유형별 평균 가격
    private Map<String, Double> averageRatingByServiceType; // 서비스 유형별 평균 평점

    // 반려동물 유형별 통계
    private Map<String, Integer> requestsByPetType; // 반려동물 유형별 요청 수
    private Map<String, Double> averagePriceByPetType; // 반려동물 유형별 평균 가격

    // 지역별 통계
    private Map<String, Integer> requestsByLocation; // 지역별 요청 수
    private Map<String, Double> averagePriceByLocation; // 지역별 평균 가격

    // 시간별 통계
    private Map<String, Integer> requestsByMonth; // 월별 요청 수
    private Map<String, Integer> requestsByDay; // 요일별 요청 수
    private Map<String, Integer> requestsByHour; // 시간대별 요청 수

    // 플랫폼 전환율
    private Double overallAcceptanceRate; // 전체 견적 수락률
    private Double averageOffersPerRequest; // 요청당 평균 견적 제안 수

    // 반려동물 특성별 통계
    private Map<String, Integer> requestsByPetBreed; // 견종/묘종별 요청 수
    private Map<String, Double> averagePriceByPetWeight; // 무게별 평균 가격
}