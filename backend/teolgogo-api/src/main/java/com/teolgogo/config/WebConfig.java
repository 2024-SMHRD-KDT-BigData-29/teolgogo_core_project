package com.teolgogo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // manifest.json 파일에 대한 캐시 설정
        registry.addResourceHandler("/manifest.json")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(0, TimeUnit.SECONDS).mustRevalidate());

        // 서비스 워커에 대한 캐시 설정 (캐싱하지 않음)
        registry.addResourceHandler("/service-worker.js")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache().mustRevalidate());

        // PWA 아이콘에 대한 캐시 설정
        registry.addResourceHandler("/icons/**")
                .addResourceLocations("classpath:/static/icons/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 경로에 대해
                .allowedOrigins(
                        "http://localhost:3000",  // 로컬 개발 환경
                        "http://127.0.0.1:3000",  // 로컬 IP
                        "http://192.168.219.165:3000", // 김형찬 IP
                        "http://192.168.219.223:3000",      // 개발자 1의 IP
                        "http://192.168.219.112:3000",      // 개발자 2의 IP
                        "https://teolgogo.com"   // 실제 도메인 (예시)
//                        "*"                       // 모든 도메인 (개발용, 상용 환경에서는 제거)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // 허용할 HTTP 메서드
                .allowedHeaders("*")  // 모든 헤더 허용
                .allowCredentials(true);  // 쿠키 허용

    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // /api/auth/** 요청을 /auth/**로 포워딩
        registry.addViewController("/api/auth/**").setViewName("forward:/auth/**");
    }
}