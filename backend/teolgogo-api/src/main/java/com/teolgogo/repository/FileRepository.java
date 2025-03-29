package com.teolgogo.repository;

import com.teolgogo.entity.FileEntity;
import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.QuoteResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    // 견적 요청으로 파일 찾기
    List<FileEntity> findByQuoteRequest(QuoteRequest quoteRequest);

    // 견적 요청 ID로 파일 찾기 (호환성을 위해 유지)
    List<FileEntity> findByQuoteRequest_Id(Long quoteRequestId);

    // 견적 요청 ID와 카테고리로 파일 찾기 (호환성을 위해 유지)
    List<FileEntity> findByQuoteRequest_IdAndCategory(Long quoteRequestId, FileEntity.FileCategory category);

    // 견적 응답으로 파일 찾기
    List<FileEntity> findByQuoteResponse(QuoteResponse quoteResponse);

    // 견적 응답 ID로 파일 찾기 (호환성을 위해 유지)
    List<FileEntity> findByQuoteResponse_Id(Long quoteResponseId);

    // 견적 응답 ID와 카테고리로 파일 찾기 (호환성을 위해 유지)
    List<FileEntity> findByQuoteResponse_IdAndCategory(Long quoteResponseId, FileEntity.FileCategory category);

    // 업로더로 파일 찾기
    List<FileEntity> findByUploader_Id(Long uploaderId);

    // 파일 타입으로 찾기
    List<FileEntity> findByFileType(String fileType);
}