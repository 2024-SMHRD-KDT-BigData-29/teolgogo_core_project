package com.teolgogo.repository;

import com.teolgogo.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    // 견적 요청 ID로 파일 찾기
    List<FileEntity> findByQuoteRequestId(Long quoteRequestId);

    // 견적 요청 ID와 카테고리로 파일 찾기
    List<FileEntity> findByQuoteRequestIdAndCategory(Long quoteRequestId, FileEntity.FileCategory category);

    // 견적 응답 ID로 파일 찾기
    List<FileEntity> findByQuoteResponseId(Long quoteResponseId);

    // 견적 응답 ID와 카테고리로 파일 찾기
    List<FileEntity> findByQuoteResponseIdAndCategory(Long quoteResponseId, FileEntity.FileCategory category);

    // 업로더로 파일 찾기
    List<FileEntity> findByUploaderId(Long uploaderId);

    // 파일 타입으로 찾기
    List<FileEntity> findByFileType(String fileType);
}