package com.teolgogo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

// 개발 환경에서만 활성화되도록 Profile 설정 (선택사항)
// 서버를 실행한 후 웹 브라우저나 Postman에서
// http://localhost:8080/api/debug/endpoints에
// 접속하면 모든 API 엔드포인트 목록을 확인

@Profile("dev")
@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

    @GetMapping("/endpoints")
    public ResponseEntity<List<String>> getEndpoints() {
        // 엔드포인트 정보를 저장할 리스트
        List<String> endpoints = new ArrayList<>();

        // 모든 엔드포인트 정보 가져오기
        Map<RequestMappingInfo, HandlerMethod> handlerMethods =
                requestMappingHandlerMapping.getHandlerMethods();

        // 결과를 보기 좋게 정렬하기 위한 TreeMap 사용
        TreeMap<String, String> sortedEndpoints = new TreeMap<>();

        // 엔드포인트 정보 처리
        handlerMethods.forEach((mappingInfo, handlerMethod) -> {
            // 경로 패턴 가져오기
            if (mappingInfo.getPatternsCondition() != null) {
                mappingInfo.getPatternsCondition().getPatterns().forEach(pattern -> {
                    // HTTP 메서드 가져오기
                    String methods = "ALL";
                    if (mappingInfo.getMethodsCondition() != null &&
                            !mappingInfo.getMethodsCondition().getMethods().isEmpty()) {
                        methods = mappingInfo.getMethodsCondition().getMethods().toString();
                    }

                    // 컨트롤러 클래스 이름과 메서드 이름 가져오기
                    String controllerName = handlerMethod.getBeanType().getSimpleName();
                    String methodName = handlerMethod.getMethod().getName();

                    // 정보 합치기
                    String endpoint = methods + " " + pattern + " -> " +
                            controllerName + "." + methodName + "()";

                    // TreeMap에 추가 (경로를 키로 사용하여 정렬)
                    sortedEndpoints.put(pattern.toString(), endpoint);
                });
            }
        });

        // 정렬된 엔드포인트 정보를 리스트에 추가
        endpoints.addAll(sortedEndpoints.values());

        return ResponseEntity.ok(endpoints);
    }

    // 추가 디버깅 메서드 (필요한 경우)
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("서버가 정상적으로 실행 중입니다.");
    }
}