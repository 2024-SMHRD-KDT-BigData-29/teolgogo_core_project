package com.teolgogo.service;

import com.teolgogo.entity.FileEntity;
import com.teolgogo.entity.User;
import com.teolgogo.repository.FileRepository;
import com.teolgogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Autowired
    public FileService(FileRepository fileRepository, UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    /**
     * 파일 업로드 처리
     */
    @Transactional
    public FileEntity storeFile(MultipartFile file, FileEntity.FileCategory category,
                                Long userId, Long quoteRequestId, Long quoteResponseId) throws IOException {

        // 파일명 가져오기 및 정규화
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // 부적절한 파일명 체크
        if (originalFileName.contains("..")) {
            throw new IOException("파일명에 부적절한 문자가 포함되어 있습니다: " + originalFileName);
        }

        // 카테고리에 맞는 디렉토리 결정
        String categoryDir = getCategoryDirectory(category);

        // 저장할 파일명 (중복 방지를 위해 UUID 사용)
        String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // 파일 저장 경로
        Path targetLocation = Paths.get(uploadDir, categoryDir).resolve(fileName);

        // 파일 저장
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // 업로드 사용자 조회
        User uploader = null;
        if (userId != null) {
            uploader = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        }

        // 파일 정보 DB에 저장
        FileEntity fileEntity = FileEntity.builder()
                .fileName(fileName)
                .originalFileName(originalFileName)
                .filePath(categoryDir + "/" + fileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .category(category)
                .uploader(uploader)
                .quoteRequestId(quoteRequestId)
                .quoteResponseId(quoteResponseId)
                .build();

        return fileRepository.save(fileEntity);
    }

    /**
     * 파일 다운로드를 위한 Resource 가져오기
     */
    public Resource loadFileAsResource(Long fileId) throws MalformedURLException {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("파일을 찾을 수 없습니다: " + fileId));

        Path filePath = Paths.get(uploadDir).resolve(fileEntity.getFilePath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        } else {
            throw new EntityNotFoundException("파일을 찾을 수 없습니다: " + fileEntity.getFileName());
        }
    }

    /**
     * 견적 요청에 연결된 반려동물 사진 목록 조회
     */
    public List<FileEntity> getPetPhotosByQuoteRequestId(Long quoteRequestId) {
        return fileRepository.findByQuoteRequestIdAndCategory(
                quoteRequestId, FileEntity.FileCategory.PET_PHOTO);
    }

    /**
     * 견적 응답에 연결된 미용 전/후 사진 목록 조회
     */
    public List<FileEntity> getBeforeAfterPhotosByQuoteResponseId(Long quoteResponseId) {
        return fileRepository.findByQuoteResponseId(quoteResponseId);
    }

    /**
     * 카테고리에 맞는 디렉토리 이름 반환
     */
    private String getCategoryDirectory(FileEntity.FileCategory category) {
        switch (category) {
            case PET_PHOTO: return "pet";
            case BEFORE_GROOMING: return "before";
            case AFTER_GROOMING: return "after";
            case BUSINESS_LICENSE: return "license";
            case PROFILE_IMAGE: return "profile";
            case OTHER:
            default: return "other";
        }
    }

    /**
     * 파일 삭제
     */
    @Transactional
    public void deleteFile(Long fileId) throws IOException {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("파일을 찾을 수 없습니다: " + fileId));

        // 파일 시스템에서 삭제
        Path filePath = Paths.get(uploadDir).resolve(fileEntity.getFilePath()).normalize();
        Files.deleteIfExists(filePath);

        // DB에서 삭제
        fileRepository.delete(fileEntity);
    }
}