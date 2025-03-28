package com.teolgogo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
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
}