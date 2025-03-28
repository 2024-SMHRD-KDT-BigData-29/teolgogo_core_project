package com.teolgogo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
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

    @Value("${app.file.max-size:10485760}") // 기본 10MB
    private long maxFileSize;

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
}