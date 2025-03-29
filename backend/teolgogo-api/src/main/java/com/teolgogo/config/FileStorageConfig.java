package com.teolgogo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.util.unit.DataSize;  // DataSize 클래스 import
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    // 변경: String으로 받아서 DataSize로 변환
    @Value("${app.file.max-size:10485760}")
    private String maxFileSizeString;

    // DataSize로 변환된 값을 저장할 필드
    private long maxFileSize;

    // 초기화 시 DataSize로 변환
    @PostConstruct
    public void init() {
        // 문자열로 지정된 경우 (10MB 등) DataSize로 변환
        if (maxFileSizeString.contains("MB") || maxFileSizeString.contains("KB")) {
            this.maxFileSize = DataSize.parse(maxFileSizeString).toBytes();
        } else {
            // 숫자만 있는 경우 직접 파싱
            this.maxFileSize = Long.parseLong(maxFileSizeString);
        }
    }

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @PostConstruct
    public void createStorageDirectories() throws IOException {
        // 임시 디렉토리 생성
        Path tempDir = Paths.get(uploadDir, "temp");
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
        }

        // 카테고리별 디렉토리 생성
        for (String category : new String[]{"pet", "before", "after", "license", "profile", "other"}) {
            Path path = Paths.get(uploadDir, category);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        }
    }

    // getter 추가
    public long getMaxFileSize() {
        return maxFileSize;
    }
}