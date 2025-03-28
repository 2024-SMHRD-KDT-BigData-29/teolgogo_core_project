plugins {
    java
    id("org.springframework.boot") version "3.1.5" // 최신 안정화 버전으로 변경
    id("io.spring.dependency-management") version "1.1.3"
}

group = "com.teolgogo"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot 기본 스타터
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")

    // 웹소켓 (채팅방 기능용)
    implementation("org.springframework.boot:spring-boot-starter-websocket")

    // JSON 처리 향상
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // 파일 업로드 처리
    implementation("commons-fileupload:commons-fileupload:1.5")
    implementation("commons-io:commons-io:2.13.0")

    // API 문서화
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.1.0")

    // 캐싱
    implementation("org.springframework.boot:spring-boot-starter-cache")

    // 결제 통합 - 카카오페이/토스페이먼츠
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf") // 결제 페이지 템플릿

    // 위치 정보 서비스 - 카카오맵 API는 프론트엔드에서 직접 사용

    // JWT 관련 의존성
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // 개발 도구
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // 데이터베이스
    runtimeOnly("org.mariadb.jdbc:mariadb-java-client")

    // 테스트
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// 추가 설정: 빌드시 기본 인코딩 지정
tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

// 개발 환경과 프로덕션 환경 설정 분리
tasks.bootJar {
    // 빌드된 JAR 파일 이름 설정
    archiveFileName.set("teolgogo-api.jar")
}