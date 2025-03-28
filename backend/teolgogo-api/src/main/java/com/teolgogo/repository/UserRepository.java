package com.teolgogo.repository;

import com.teolgogo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // 위치 기반 업체 검색 (반경 내)
    @Query(value =
            "SELECT u.* FROM users u " +
                    "WHERE u.role = 'BUSINESS' " +
                    "AND u.latitude IS NOT NULL " +
                    "AND u.longitude IS NOT NULL " +
                    "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
                    "cos(radians(u.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(u.latitude)))) <= :radius " +
                    "ORDER BY (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
                    "cos(radians(u.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(u.latitude)))) ASC",
            nativeQuery = true)
    List<User> findBusinessesNearLocation(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius);

    // 특정 전문 분야를 가진 업체 검색
    @Query("SELECT u FROM User u JOIN u.specialties s WHERE u.role = 'BUSINESS' AND s = :specialty")
    List<User> findBusinessesBySpecialty(@Param("specialty") String specialty);

    // 핸드폰 번호로 사용자 찾기
    Optional<User> findByPhone(String phone);

    // 이름으로 사용자 검색 (부분 일치)
    List<User> findByNameContaining(String name);

    // 역할별 사용자 목록 조회
    List<User> findByRole(User.Role role);

    // 소셜 로그인 제공자별 사용자 조회
    List<User> findByProvider(User.AuthProvider provider);

    // 비즈니스 이름으로 업체 검색 (부분 일치)
    @Query("SELECT u FROM User u WHERE u.role = 'BUSINESS' AND u.businessName LIKE %:keyword%")
    List<User> findBusinessesByNameKeyword(@Param("keyword") String keyword);
}