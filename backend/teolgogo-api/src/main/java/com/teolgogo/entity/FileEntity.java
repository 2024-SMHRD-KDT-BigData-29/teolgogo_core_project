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

    // 연관 ID들 (견적 요청, 견적 응답에 연결될 수 있음)
    private Long quoteRequestId;
    private Long quoteResponseId;

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
}