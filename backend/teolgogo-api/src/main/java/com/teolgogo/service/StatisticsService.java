package com.teolgogo.service;

import com.teolgogo.dto.BusinessStatisticsDTO;
import com.teolgogo.dto.ServiceStatisticsDTO;
import com.teolgogo.entity.*;
import com.teolgogo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
// import javax.persistence.EntityNotFoundException;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Autowired
    public StatisticsService(
            QuoteRequestRepository quoteRequestRepository,
            QuoteResponseRepository quoteResponseRepository,
            PaymentRepository paymentRepository,
            ReviewRepository reviewRepository,
            UserRepository userRepository) {
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    /**
     * 업체 통계 조회
     */
    @Transactional(readOnly = true)
    public BusinessStatisticsDTO getBusinessStatistics(Long businessId) {
        User business = userRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("업체를 찾을 수 없습니다."));

        if (business.getRole() != User.Role.BUSINESS) {
            throw new IllegalArgumentException("업체 회원만 통계를 조회할 수 있습니다.");
        }

        BusinessStatisticsDTO.BusinessStatisticsDTOBuilder builder = BusinessStatisticsDTO.builder()
                .businessId(businessId)
                .businessName(business.getBusinessName() != null ? business.getBusinessName() : business.getName());

        // 견적 관련 통계
        List<QuoteResponse> allOffers = quoteResponseRepository.findByBusinessId(businessId);
        List<QuoteResponse> acceptedOffers = allOffers.stream()
                .filter(offer -> offer.getStatus() == QuoteResponse.ResponseStatus.ACCEPTED)
                .collect(Collectors.toList());

        builder.totalQuoteOffers(allOffers.size());
        builder.acceptedQuoteOffers(acceptedOffers.size());

        // 견적 수락률
        double acceptanceRate = allOffers.isEmpty() ? 0 : (double) acceptedOffers.size() / allOffers.size() * 100;
        builder.acceptanceRate(Math.round(acceptanceRate * 100) / 100.0);

        // 매출 관련 통계
        List<Payment> payments = paymentRepository.findByBusinessId(businessId);
        List<Payment> completedPayments = payments.stream()
                .filter(payment -> payment.getStatus() == Payment.PaymentStatus.DONE)
                .collect(Collectors.toList());

        int totalRevenue = completedPayments.stream()
                .mapToInt(Payment::getAmount)
                .sum();

        int averageRevenue = completedPayments.isEmpty() ? 0 : totalRevenue / completedPayments.size();

        builder.totalRevenue(totalRevenue);
        builder.averageRevenue(averageRevenue);

        // 월별 매출
        Map<String, Integer> revenueByMonth = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        completedPayments.forEach(payment -> {
            String month = payment.getPaidAt().format(monthFormatter);
            revenueByMonth.put(month, revenueByMonth.getOrDefault(month, 0) + payment.getAmount());
        });

        builder.revenueByMonth(revenueByMonth);

        // 서비스 유형별 매출
        Map<String, Integer> revenueByService = new HashMap<>();
        completedPayments.forEach(payment -> {
            QuoteRequest request = payment.getQuoteResponse().getQuoteRequest();
            String serviceType = request.getServiceType().getDisplayName();
            revenueByService.put(serviceType, revenueByService.getOrDefault(serviceType, 0) + payment.getAmount());
        });

        builder.revenueByService(revenueByService);

        // 리뷰 관련 통계
        List<Review> reviews = reviewRepository.findByBusinessId(businessId);
        Double averageRating = reviewRepository.calculateAverageRatingByBusinessId(businessId);

        builder.totalReviews(reviews.size());
        builder.averageRating(averageRating != null ? Math.round(averageRating * 10) / 10.0 : 0.0);

        // 평점 분포
        Map<Integer, Integer> ratingDistribution = new HashMap<>();
        reviews.forEach(review -> {
            ratingDistribution.put(review.getRating(), ratingDistribution.getOrDefault(review.getRating(), 0) + 1);
        });

        builder.ratingDistribution(ratingDistribution);

        // 인기 태그
        Map<String, Integer> popularTags = new HashMap<>();
        reviews.forEach(review -> {
            if (review.getTags() != null) {
                review.getTags().forEach(tag -> {
                    popularTags.put(tag, popularTags.getOrDefault(tag, 0) + 1);
                });
            }
        });

        builder.popularTags(popularTags);

        // 요일별 요청 수
        Map<String, Integer> requestsByDay = new HashMap<>();
        allOffers.forEach(offer -> {
            QuoteRequest request = offer.getQuoteRequest();
            DayOfWeek dayOfWeek = request.getCreatedAt().getDayOfWeek();
            String day = dayOfWeek.toString();
            requestsByDay.put(day, requestsByDay.getOrDefault(day, 0) + 1);
        });

        builder.requestsByDay(requestsByDay);

        // 시간대별 요청 수
        Map<String, Integer> requestsByHour = new HashMap<>();
        allOffers.forEach(offer -> {
            QuoteRequest request = offer.getQuoteRequest();
            int hour = request.getCreatedAt().getHour();
            String hourStr = hour + "시";
            requestsByHour.put(hourStr, requestsByHour.getOrDefault(hourStr, 0) + 1);
        });

        builder.requestsByHour(requestsByHour);

        return builder.build();
    }

    /**
     * 서비스 유형별 통계 조회
     */
    @Transactional(readOnly = true)
    public ServiceStatisticsDTO getServiceStatistics() {
        ServiceStatisticsDTO.ServiceStatisticsDTOBuilder builder = ServiceStatisticsDTO.builder();

        // 서비스 유형별 요청 수
        Map<String, Integer> requestsByServiceType = new HashMap<>();
        for (QuoteRequest.ServiceType serviceType : QuoteRequest.ServiceType.values()) {
            List<QuoteRequest> requests = quoteRequestRepository.findByServiceType(serviceType);
            requestsByServiceType.put(serviceType.getDisplayName(), requests.size());
        }

        builder.requestsByServiceType(requestsByServiceType);

        // 서비스 유형별 평균 가격
        Map<String, Double> averagePriceByServiceType = new HashMap<>();
        for (QuoteRequest.ServiceType serviceType : QuoteRequest.ServiceType.values()) {
            List<QuoteRequest> requests = quoteRequestRepository.findByServiceType(serviceType);

            if (!requests.isEmpty()) {
                List<Integer> prices = new ArrayList<>();

                for (QuoteRequest request : requests) {
                    List<QuoteResponse> responses = quoteResponseRepository.findByQuoteRequestId(request.getId());

                    for (QuoteResponse response : responses) {
                        if (response.getStatus() == QuoteResponse.ResponseStatus.ACCEPTED) {
                            prices.add(response.getPrice());
                            break;
                        }
                    }
                }

                if (!prices.isEmpty()) {
                    double averagePrice = prices.stream().mapToInt(Integer::intValue).average().orElse(0);
                    averagePriceByServiceType.put(serviceType.getDisplayName(), Math.round(averagePrice * 100) / 100.0);
                } else {
                    averagePriceByServiceType.put(serviceType.getDisplayName(), 0.0);
                }
            } else {
                averagePriceByServiceType.put(serviceType.getDisplayName(), 0.0);
            }
        }

        builder.averagePriceByServiceType(averagePriceByServiceType);

        // 반려동물 유형별 요청 수
        Map<String, Integer> requestsByPetType = new HashMap<>();
        for (QuoteRequest.PetType petType : QuoteRequest.PetType.values()) {
            List<QuoteRequest> requests = quoteRequestRepository.findByPetType(petType);
            requestsByPetType.put(petType.name(), requests.size());
        }

        builder.requestsByPetType(requestsByPetType);

        // 월별 요청 수
        Map<String, Integer> requestsByMonth = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        List<QuoteRequest> allRequests = quoteRequestRepository.findAll();
        allRequests.forEach(request -> {
            String month = request.getCreatedAt().format(monthFormatter);
            requestsByMonth.put(month, requestsByMonth.getOrDefault(month, 0) + 1);
        });

        builder.requestsByMonth(requestsByMonth);

        // 전체 견적 수락률
        List<QuoteResponse> allResponses = quoteResponseRepository.findAll();
        long acceptedResponsesCount = allResponses.stream()
                .filter(response -> response.getStatus() == QuoteResponse.ResponseStatus.ACCEPTED)
                .count();

        double overallAcceptanceRate = allResponses.isEmpty() ? 0
                : (double) acceptedResponsesCount / allResponses.size() * 100;

        builder.overallAcceptanceRate(Math.round(overallAcceptanceRate * 100) / 100.0);

        // 요청당 평균 견적 제안 수
        double avgOffersPerRequest = 0;
        if (!allRequests.isEmpty()) {
            int totalOffers = 0;
            for (QuoteRequest request : allRequests) {
                List<QuoteResponse> responses = quoteResponseRepository.findByQuoteRequestId(request.getId());
                totalOffers += responses.size();
            }
            avgOffersPerRequest = (double) totalOffers / allRequests.size();
        }

        builder.averageOffersPerRequest(Math.round(avgOffersPerRequest * 100) / 100.0);

        return builder.build();
    }

    /**
     * 기간별 통계 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPeriodStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> statistics = new HashMap<>();

        // 기간 내 견적 요청 수
        List<QuoteRequest> requests = quoteRequestRepository.findRequestsAfterDate(startDate)
                .stream()
                .filter(request -> request.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        statistics.put("totalRequests", requests.size());

        // 기간 내 결제 완료 건수 및 매출
        List<Payment> payments = paymentRepository.findByCreatedAtBetween(startDate, endDate)
                .stream()
                .filter(payment -> payment.getStatus() == Payment.PaymentStatus.DONE)
                .collect(Collectors.toList());

        statistics.put("totalPayments", payments.size());
        statistics.put("totalRevenue", payments.stream().mapToInt(Payment::getAmount).sum());

        // 기간 내 평균 평점
        List<Review> reviews = reviewRepository.findByCreatedAtBetween(startDate, endDate);
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);

        statistics.put("totalReviews", reviews.size());
        statistics.put("averageRating", Math.round(averageRating * 10) / 10.0);

        // 기간 내 인기 서비스
        Map<String, Integer> serviceTypeCount = new HashMap<>();
        for (QuoteRequest request : requests) {
            String serviceType = request.getServiceType().getDisplayName();
            serviceTypeCount.put(serviceType, serviceTypeCount.getOrDefault(serviceType, 0) + 1);
        }

        String popularService = "";
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : serviceTypeCount.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                popularService = entry.getKey();
            }
        }

        statistics.put("popularService", popularService);
        statistics.put("serviceTypeCount", serviceTypeCount);

        return statistics;
    }
}