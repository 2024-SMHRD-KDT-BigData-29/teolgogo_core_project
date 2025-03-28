package com.teolgogo.controller;

import com.teolgogo.dto.CreateQuoteRequestDTO;
import com.teolgogo.dto.QuoteRequestDTO;
import com.teolgogo.dto.QuoteResponseDTO;
import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.User;
import com.teolgogo.service.QuoteService;
import com.teolgogo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;
    private final NotificationService notificationService;

    @Autowired
    public QuoteController(QuoteService quoteService, NotificationService notificationService) {
        this.quoteService = quoteService;
        this.notificationService = notificationService;
    }

    /**
     * 견적 요청 생성 (파일 업로드 지원)
     */
    @PostMapping(value = "/requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuoteRequestDTO> createQuoteRequestWithPhotos(
            @AuthenticationPrincipal User user,
            @RequestPart("request") @Valid CreateQuoteRequestDTO requestDTO,
            @RequestPart(value = "petPhotos", required = false) List<MultipartFile> petPhotos) {

        QuoteRequestDTO createdRequest = quoteService.createQuoteRequest(user, requestDTO, petPhotos);

        // 주변 업체에 푸시 알림 전송
        notificationService.sendQuoteRequestNotification(createdRequest.getId());

        return ResponseEntity.ok(createdRequest);
    }

    // 견적 요청 목록 조회 (고객용)
    @GetMapping("/customer/requests")
    public ResponseEntity<List<QuoteRequestDTO>> getCustomerQuoteRequests(
            @AuthenticationPrincipal User user) {
        List<QuoteRequestDTO> requests = quoteService.getCustomerQuoteRequests(user.getId());
        return ResponseEntity.ok(requests);
    }

    // 견적 요청 목록 조회 (업체용)
    @GetMapping("/business/available")
    public ResponseEntity<List<QuoteRequestDTO>> getAvailableQuoteRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius) {

        List<QuoteRequestDTO> requests = quoteService.getAvailableQuoteRequests(
                user.getId(), latitude, longitude, radius);
        return ResponseEntity.ok(requests);
    }

    // 견적 요청 상세 조회
    @GetMapping("/requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getQuoteRequestDetails(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId) {

        Map<String, Object> response = quoteService.getQuoteRequestDetails(user.getId(), requestId);
        return ResponseEntity.ok(response);
    }

    // 견적 제안 생성 (업체용)
    @PostMapping("/requests/{requestId}/offers")
    public ResponseEntity<QuoteResponseDTO> createQuoteOffer(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId,
            @Valid @RequestBody QuoteResponseDTO offerDTO) {

        QuoteResponseDTO createdOffer = quoteService.createQuoteOffer(user, requestId, offerDTO);

        // 고객에게 견적 제안 알림 전송
        notificationService.sendQuoteOfferNotification(createdOffer.getId());

        return ResponseEntity.ok(createdOffer);
    }

    // 견적 수락 (고객용)
    @PostMapping("/requests/{requestId}/offers/{offerId}/accept")
    public ResponseEntity<QuoteResponseDTO> acceptQuoteOffer(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId,
            @PathVariable Long offerId) {

        QuoteResponseDTO acceptedOffer = quoteService.acceptQuoteOffer(user.getId(), requestId, offerId);

        // 업체에게 견적 수락 알림 전송
        notificationService.sendQuoteAcceptNotification(acceptedOffer.getId());

        return ResponseEntity.ok(acceptedOffer);
    }

    /**
     * 미용 완료 후 사진 업로드 (업체용)
     */
    @PostMapping(value = "/responses/{responseId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<?> uploadGroomingPhotos(
            @AuthenticationPrincipal User user,
            @PathVariable Long responseId,
            @RequestPart(value = "beforePhotos", required = false) List<MultipartFile> beforePhotos,
            @RequestPart(value = "afterPhotos", required = false) List<MultipartFile> afterPhotos) {

        try {
            quoteService.uploadGroomingPhotos(user.getId(), responseId, beforePhotos, afterPhotos);

            // 고객에게 미용 완료 알림 전송
            notificationService.sendGroomingCompletedNotification(responseId);

            return ResponseEntity.ok().body(Map.of("message", "미용 사진이 성공적으로 업로드되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}