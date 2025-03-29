package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "files")
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName; // 저장된 파일명

    private String originalFileName; // 원본 파일명

    @Column(nullable = false)
    private String filePath; // 파일 경로

    private String fileType; // 파일 타입 (MIME 타입)

    private Long fileSize; // 파일 크기 (바이트)

    @Enumerated(EnumType.STRING)
    private FileCategory category; // 파일 카테고리

    private LocalDateTime uploadedAt; // 업로드 시간

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id")
    private User uploader; // 업로드한 사용자

    // 연관 ID들을 엔티티 참조로 변경
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_request_id")
    private QuoteRequest quoteRequest; // 견적 요청 참조

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_response_id")
    private QuoteResponse quoteResponse; // 견적 응답 참조

    @PrePersist
    public void prePersist() {
        uploadedAt = LocalDateTime.now();
    }

    // 파일 카테고리 enum
    public enum FileCategory {
        PET_PHOTO, // 반려동물 사진
        BEFORE_GROOMING, // 미용 전 사진
        AFTER_GROOMING, // 미용 후 사진
        BUSINESS_LICENSE, // 사업자등록증
        PROFILE_IMAGE, // 프로필 이미지
        OTHER // 기타
    }

    // 필요 시 이전 ID 필드 접근을 위한 유틸리티 메서드
    public Long getQuoteRequestId() {
        return quoteRequest != null ? quoteRequest.getId() : null;
    }

    public Long getQuoteResponseId() {
        return quoteResponse != null ? quoteResponse.getId() : null;
    }

    // 이전 ID 필드를 설정하는 유틸리티 메서드
    public void setQuoteRequestId(Long id) {
        if (id == null) {
            this.quoteRequest = null;
            return;
        }

        // 이미 quoteRequest가 있고 ID가 동일하면 변경하지 않음
        if (this.quoteRequest != null && this.quoteRequest.getId().equals(id)) {
            return;
        }

        // 객체를 직접 참조할 수 없으므로 임시 객체 생성
        QuoteRequest temp = new QuoteRequest();
        temp.setId(id);
        this.quoteRequest = temp;
    }

    public void setQuoteResponseId(Long id) {
        if (id == null) {
            this.quoteResponse = null;
            return;
        }

        // 이미 quoteResponse가 있고 ID가 동일하면 변경하지 않음
        if (this.quoteResponse != null && this.quoteResponse.getId().equals(id)) {
            return;
        }

        // 객체를 직접 참조할 수 없으므로 임시 객체 생성
        QuoteResponse temp = new QuoteResponse();
        temp.setId(id);
        this.quoteResponse = temp;
    }
}