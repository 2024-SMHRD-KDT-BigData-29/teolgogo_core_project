package com.teolgogo.service;

import com.teolgogo.dto.CreateQuoteRequestDTO;
import com.teolgogo.dto.QuoteItemDTO;
import com.teolgogo.dto.QuoteRequestDTO;
import com.teolgogo.dto.QuoteResponseDTO;
import com.teolgogo.entity.FileEntity;
import com.teolgogo.entity.QuoteItem;
import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.QuoteResponse;
import com.teolgogo.entity.User;
import com.teolgogo.repository.QuoteRequestRepository;
import com.teolgogo.repository.QuoteResponseRepository;
import com.teolgogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuoteService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteResponseRepository quoteResponseRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final NotificationService notificationService;

    @Autowired
    public QuoteService(
            QuoteRequestRepository quoteRequestRepository,
            QuoteResponseRepository quoteResponseRepository,
            UserRepository userRepository,
            FileService fileService,
            NotificationService notificationService) {
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteResponseRepository = quoteResponseRepository;
        this.userRepository = userRepository;
        this.fileService = fileService;
        this.notificationService = notificationService;
    }

    // 견적 요청 생성
    @Transactional
    public QuoteRequestDTO createQuoteRequest(User customer, CreateQuoteRequestDTO requestDTO, List<MultipartFile> petPhotos) {
        if (!customer.getRole().equals(User.Role.CUSTOMER)) {
            throw new AccessDeniedException("견적 요청은 고객만 가능합니다.");
        }

        QuoteRequest quoteRequest = QuoteRequest.builder()
                .customer(customer)
                .petType(requestDTO.getPetType())
                .petBreed(requestDTO.getPetBreed())
                .petAge(requestDTO.getPetAge())
                .petWeight(requestDTO.getPetWeight())
                .serviceType(requestDTO.getServiceType())
                .description(requestDTO.getDescription())
                .latitude(requestDTO.getLatitude())
                .longitude(requestDTO.getLongitude())
                .address(requestDTO.getAddress())
                .preferredDate(requestDTO.getPreferredDate())
                .build();

        // 서비스 아이템 추가
        if (requestDTO.getItems() != null && !requestDTO.getItems().isEmpty()) {
            List<QuoteItem> items = requestDTO.getItems().stream()
                    .map(itemDTO -> QuoteItem.builder()
                            .quoteRequest(quoteRequest)
                            .name(itemDTO.getName())
                            .description(itemDTO.getDescription())
                            .price(itemDTO.getPrice())
                            .type(itemDTO.getType())
                            .build())
                    .collect(Collectors.toList());
            quoteRequest.setItems(items);
        }

        QuoteRequest savedRequest = quoteRequestRepository.save(quoteRequest);

        // 반려동물 사진 업로드 및 연결
        if (petPhotos != null && !petPhotos.isEmpty()) {
            for (MultipartFile photo : petPhotos) {
                try {
                    fileService.storeFile(
                            photo,
                            FileEntity.FileCategory.PET_PHOTO,
                            customer.getId(),
                            savedRequest.getId(),
                            null
                    );
                } catch (IOException e) {
                    throw new RuntimeException("반려동물 사진 업로드에 실패했습니다.", e);
                }
            }
        }

        return QuoteRequestDTO.fromEntity(savedRequest);
    }

    // 고객의 견적 요청 목록 조회
    @Transactional(readOnly = true)
    public List<QuoteRequestDTO> getCustomerQuoteRequests(Long customerId) {
        List<QuoteRequest> requests = quoteRequestRepository.findByCustomerId(customerId);
        return requests.stream()
                .map(QuoteRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 업체가 볼 수 있는 견적 요청 목록 조회 (위치 기반)
    @Transactional(readOnly = true)
    public List<QuoteRequestDTO> getAvailableQuoteRequests(
            Long businessId, Double latitude, Double longitude, Double radius) {

        // 업체 사용자 확인
        User business = userRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        if (!business.getRole().equals(User.Role.BUSINESS)) {
            throw new AccessDeniedException("업체만 접근 가능합니다.");
        }

        // 기본 반경 5km
        if (radius == null) {
            radius = 5.0;
        }

        // 업체의 위치가 설정되어 있지 않으면 매개변수 사용
        if (business.getLatitude() == null && latitude != null) {
            business.setLatitude(latitude);
        }

        if (business.getLongitude() == null && longitude != null) {
            business.setLongitude(longitude);
        }

        // 위치 정보가 없으면 전체 요청 반환
        if (business.getLatitude() == null || business.getLongitude() == null) {
            List<QuoteRequest> allRequests = quoteRequestRepository.findByStatus(QuoteRequest.RequestStatus.PENDING);
            return allRequests.stream()
                    .map(QuoteRequestDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        // 위치 기반 요청 필터링
        List<QuoteRequest> requests = quoteRequestRepository.findByStatusAndLocation(
                QuoteRequest.RequestStatus.PENDING,
                business.getLatitude(),
                business.getLongitude(),
                radius);

        return requests.stream()
                .map(QuoteRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 견적 요청 상세 조회
    @Transactional(readOnly = true)
    public Map<String, Object> getQuoteRequestDetails(Long userId, Long requestId) {
        QuoteRequest request = quoteRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("견적 요청을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 접근 권한 확인 (고객 본인 또는 업체만 접근 가능)
        boolean isCustomer = request.getCustomer().getId().equals(userId);
        boolean isBusiness = user.getRole().equals(User.Role.BUSINESS);

        if (!isCustomer && !isBusiness) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("request", QuoteRequestDTO.fromEntity(request));

        // 서비스 아이템 정보 추가
        List<QuoteItemDTO> items = request.getItems().stream()
                .map(QuoteItemDTO::fromEntity)
                .collect(Collectors.toList());
        response.put("items", items);

        // 견적 제안 목록 (고객인 경우에만 모든 제안을 볼 수 있음)
        if (isCustomer) {
            List<QuoteResponseDTO> offers = request.getResponses().stream()
                    .map(QuoteResponseDTO::fromEntity)
                    .collect(Collectors.toList());
            response.put("offers", offers);
        } else {
            // 업체인 경우 자신의 제안만 볼 수 있음
            List<QuoteResponseDTO> myOffers = request.getResponses().stream()
                    .filter(offer -> offer.getBusiness().getId().equals(userId))
                    .map(QuoteResponseDTO::fromEntity)
                    .collect(Collectors.toList());
            response.put("myOffers", myOffers);
        }

        return response;
    }

    // 견적 제안 생성 (업체용)
    @Transactional
    public QuoteResponseDTO createQuoteOffer(User business, Long requestId, QuoteResponseDTO offerDTO) {
        if (!business.getRole().equals(User.Role.BUSINESS)) {
            throw new AccessDeniedException("견적 제안은 업체만 가능합니다.");
        }

        QuoteRequest request = quoteRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("견적 요청을 찾을 수 없습니다."));

        // 이미 처리된 요청인지 확인
        if (!request.getStatus().equals(QuoteRequest.RequestStatus.PENDING)) {
            throw new IllegalStateException("이미 처리된 견적 요청입니다.");
        }

        // 이미 제안을 했는지 확인
        boolean alreadyOffered = request.getResponses().stream()
                .anyMatch(offer -> offer.getBusiness().getId().equals(business.getId()));

        if (alreadyOffered) {
            throw new IllegalStateException("이미 견적을 제안했습니다.");
        }

        QuoteResponse quoteResponse = QuoteResponse.builder()
                .quoteRequest(request)
                .business(business)
                .price(offerDTO.getPrice())
                .description(offerDTO.getDescription())
                .estimatedTime(offerDTO.getEstimatedTime())
                .availableDate(offerDTO.getAvailableDate())
                .build();

        QuoteResponse savedResponse = quoteResponseRepository.save(quoteResponse);

        // 견적 요청 상태 업데이트
        if (request.getStatus() == QuoteRequest.RequestStatus.PENDING) {
            request.setStatus(QuoteRequest.RequestStatus.OFFERED);
            quoteRequestRepository.save(request);
        }

        return QuoteResponseDTO.fromEntity(savedResponse);
    }

    // 견적 수락 (고객용)
    @Transactional
    public QuoteResponseDTO acceptQuoteOffer(Long customerId, Long requestId, Long offerId) {
        QuoteRequest request = quoteRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("견적 요청을 찾을 수 없습니다."));

        // 요청한 고객인지 확인
        if (!request.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("견적을 수락할 권한이 없습니다.");
        }

        // 이미 처리된 요청인지 확인
        if (request.getStatus() == QuoteRequest.RequestStatus.ACCEPTED ||
                request.getStatus() == QuoteRequest.RequestStatus.COMPLETED) {
            throw new IllegalStateException("이미 수락된 견적 요청입니다.");
        }

        // 견적 제안 찾기
        QuoteResponse offer = request.getResponses().stream()
                .filter(response -> response.getId().equals(offerId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("견적 제안을 찾을 수 없습니다."));

        // 견적 상태 업데이트
        offer.setStatus(QuoteResponse.ResponseStatus.ACCEPTED);

        // 결제 상태 업데이트
        offer.setPaymentStatus(QuoteResponse.PaymentStatus.PAID);
        QuoteResponse acceptedOffer = quoteResponseRepository.save(offer);

        // 업체의 완료된 서비스 수 증가
        User business = offer.getBusiness();
        business.incrementCompletedServices();
        userRepository.save(business);

        // 다른 제안들은 거절 상태로 변경
        request.getResponses().stream()
                .filter(response -> !response.getId().equals(offerId))
                .forEach(response -> {
                    response.setStatus(QuoteResponse.ResponseStatus.REJECTED);
                    quoteResponseRepository.save(response);
                });

        // 견적 요청 상태 업데이트
        request.setStatus(QuoteRequest.RequestStatus.ACCEPTED);
        quoteRequestRepository.save(request);

        return QuoteResponseDTO.fromEntity(acceptedOffer);
    }

    /**
     * 미용 완료 후 사진 업로드 (업체용)
     */
    @Transactional
    public void uploadGroomingPhotos(Long businessId, Long quoteResponseId,
                                     List<MultipartFile> beforePhotos,
                                     List<MultipartFile> afterPhotos) {

        QuoteResponse quoteResponse = quoteResponseRepository.findById(quoteResponseId)
                .orElseThrow(() -> new EntityNotFoundException("견적 응답을 찾을 수 없습니다."));

        // 권한 확인
        if (!quoteResponse.getBusiness().getId().equals(businessId)) {
            throw new AccessDeniedException("사진을 업로드할 권한이 없습니다.");
        }

        // 상태 확인 (수락된 견적이어야 함)
        if (quoteResponse.getStatus() != QuoteResponse.ResponseStatus.ACCEPTED) {
            throw new IllegalStateException("수락된 견적만 사진을 업로드할 수 있습니다.");
        }

        // 미용 전 사진 업로드
        if (beforePhotos != null && !beforePhotos.isEmpty()) {
            for (MultipartFile photo : beforePhotos) {
                try {
                    fileService.storeFile(
                            photo,
                            FileEntity.FileCategory.BEFORE_GROOMING,
                            businessId,
                            null,
                            quoteResponseId
                    );
                } catch (IOException e) {
                    throw new RuntimeException("미용 전 사진 업로드에 실패했습니다.", e);
                }
            }
        }

        // 미용 후 사진 업로드
        if (afterPhotos != null && !afterPhotos.isEmpty()) {
            for (MultipartFile photo : afterPhotos) {
                try {
                    fileService.storeFile(
                            photo,
                            FileEntity.FileCategory.AFTER_GROOMING,
                            businessId,
                            null,
                            quoteResponseId
                    );
                } catch (IOException e) {
                    throw new RuntimeException("미용 후 사진 업로드에 실패했습니다.", e);
                }
            }
        }

        // 견적 요청 상태를 COMPLETED로 변경
        QuoteRequest quoteRequest = quoteResponse.getQuoteRequest();
        quoteRequest.setStatus(QuoteRequest.RequestStatus.COMPLETED);
        quoteRequestRepository.save(quoteRequest);
    }
}