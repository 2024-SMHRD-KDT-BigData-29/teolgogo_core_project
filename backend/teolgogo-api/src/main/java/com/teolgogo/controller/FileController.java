package com.teolgogo.controller;

import com.teolgogo.entity.FileEntity;
import com.teolgogo.entity.User;
import com.teolgogo.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * 단일 파일 업로드
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "quoteRequestId", required = false) Long quoteRequestId,
            @RequestParam(value = "quoteResponseId", required = false) Long quoteResponseId) {

        try {
            FileEntity.FileCategory fileCategory = FileEntity.FileCategory.valueOf(category);

            FileEntity fileEntity = fileService.storeFile(file, fileCategory,
                    user.getId(), quoteRequestId, quoteResponseId);

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/files/")
                    .path(fileEntity.getId().toString())
                    .toUriString();

            Map<String, Object> response = new HashMap<>();
            response.put("id", fileEntity.getId());
            response.put("fileName", fileEntity.getFileName());
            response.put("originalFileName", fileEntity.getOriginalFileName());
            response.put("fileType", fileEntity.getFileType());
            response.put("fileSize", fileEntity.getFileSize());
            response.put("url", fileDownloadUri);

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            return ResponseEntity.badRequest().body("파일 업로드에 실패했습니다: " + ex.getMessage());
        }
    }

    /**
     * 다중 파일 업로드
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleFiles(
            @AuthenticationPrincipal User user,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("category") String category,
            @RequestParam(value = "quoteRequestId", required = false) Long quoteRequestId,
            @RequestParam(value = "quoteResponseId", required = false) Long quoteResponseId) {

        try {
            FileEntity.FileCategory fileCategory = FileEntity.FileCategory.valueOf(category);

            List<Map<String, Object>> uploadResults = Arrays.stream(files)
                    .map(file -> {
                        try {
                            FileEntity fileEntity = fileService.storeFile(file, fileCategory,
                                    user.getId(), quoteRequestId, quoteResponseId);

                            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                                    .path("/files/")
                                    .path(fileEntity.getId().toString())
                                    .toUriString();

                            Map<String, Object> fileInfo = new HashMap<>();
                            fileInfo.put("id", fileEntity.getId());
                            fileInfo.put("fileName", fileEntity.getFileName());
                            fileInfo.put("originalFileName", fileEntity.getOriginalFileName());
                            fileInfo.put("fileType", fileEntity.getFileType());
                            fileInfo.put("fileSize", fileEntity.getFileSize());
                            fileInfo.put("url", fileDownloadUri);

                            return fileInfo;
                        } catch (IOException ex) {
                            Map<String, Object> error = new HashMap<>();
                            error.put("error", "파일 업로드에 실패했습니다: " + ex.getMessage());
                            error.put("originalFileName", file.getOriginalFilename());
                            return error;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(uploadResults);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("파일 업로드에 실패했습니다: " + ex.getMessage());
        }
    }

    /**
     * 파일 다운로드
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId, HttpServletRequest request) {
        try {
            Resource resource = fileService.loadFileAsResource(fileId);

            // 미디어 타입 설정
            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 견적 요청에 연결된 반려동물 사진 목록 조회
     */
    @GetMapping("/quote-request/{quoteRequestId}/pet-photos")
    public ResponseEntity<?> getPetPhotosByQuoteRequest(@PathVariable Long quoteRequestId) {
        List<FileEntity> photos = fileService.getPetPhotosByQuoteRequestId(quoteRequestId);

        List<Map<String, Object>> photoInfos = photos.stream()
                .map(photo -> {
                    String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/files/")
                            .path(photo.getId().toString())
                            .toUriString();

                    Map<String, Object> photoInfo = new HashMap<>();
                    photoInfo.put("id", photo.getId());
                    photoInfo.put("fileName", photo.getFileName());
                    photoInfo.put("originalFileName", photo.getOriginalFileName());
                    photoInfo.put("fileType", photo.getFileType());
                    photoInfo.put("url", fileDownloadUri);

                    return photoInfo;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(photoInfos);
    }

    /**
     * 견적 응답에 연결된 미용 전/후 사진 목록 조회
     */
    @GetMapping("/quote-response/{quoteResponseId}/photos")
    public ResponseEntity<?> getPhotosByQuoteResponse(@PathVariable Long quoteResponseId) {
        List<FileEntity> photos = fileService.getBeforeAfterPhotosByQuoteResponseId(quoteResponseId);

        Map<String, List<Map<String, Object>>> result = new HashMap<>();

        // 미용 전 사진과 미용 후 사진 분리
        List<Map<String, Object>> beforePhotos = photos.stream()
                .filter(photo -> photo.getCategory() == FileEntity.FileCategory.BEFORE_GROOMING)
                .map(this::convertToFileInfo)
                .collect(Collectors.toList());

        List<Map<String, Object>> afterPhotos = photos.stream()
                .filter(photo -> photo.getCategory() == FileEntity.FileCategory.AFTER_GROOMING)
                .map(this::convertToFileInfo)
                .collect(Collectors.toList());

        result.put("beforePhotos", beforePhotos);
        result.put("afterPhotos", afterPhotos);

        return ResponseEntity.ok(result);
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long fileId) {
        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.ok().body(Map.of("message", "파일이 성공적으로 삭제되었습니다."));
        } catch (IOException ex) {
            return ResponseEntity.badRequest().body("파일 삭제에 실패했습니다: " + ex.getMessage());
        }
    }

    // FileEntity를 Map으로 변환하는 헬퍼 메서드
    private Map<String, Object> convertToFileInfo(FileEntity file) {
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/files/")
                .path(file.getId().toString())
                .toUriString();

        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("id", file.getId());
        fileInfo.put("fileName", file.getFileName());
        fileInfo.put("originalFileName", file.getOriginalFileName());
        fileInfo.put("fileType", file.getFileType());
        fileInfo.put("url", fileDownloadUri);

        return fileInfo;
    }
}