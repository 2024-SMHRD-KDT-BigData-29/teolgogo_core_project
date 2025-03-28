package com.teolgogo.controller;

import com.teolgogo.dto.BusinessStatisticsDTO;
import com.teolgogo.dto.ServiceStatisticsDTO;
import com.teolgogo.entity.User;
import com.teolgogo.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * 업체 통계 조회
     */
    @GetMapping("/business")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<?> getBusinessStatistics(@AuthenticationPrincipal User user) {
        try {
            BusinessStatisticsDTO statistics = statisticsService.getBusinessStatistics(user.getId());
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 특정 업체 통계 조회 (관리자용)
     */
    @GetMapping("/business/{businessId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSpecificBusinessStatistics(@PathVariable Long businessId) {
        try {
            BusinessStatisticsDTO statistics = statisticsService.getBusinessStatistics(businessId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 서비스 유형별 통계 조회
     */
    @GetMapping("/service-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getServiceTypeStatistics() {
        try {
            ServiceStatisticsDTO statistics = statisticsService.getServiceStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 기간별 통계 조회
     */
    @GetMapping("/period")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPeriodStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        try {
            Map<String, Object> statistics = statisticsService.getPeriodStatistics(startDate, endDate);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}