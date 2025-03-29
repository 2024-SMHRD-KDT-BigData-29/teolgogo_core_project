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

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    // 위치 기반 주변 업체 찾기
    @Query(value =
            "SELECT u FROM User u " +
                    "WHERE u.role = :role " +
                    "AND u.latitude IS NOT NULL " +
                    "AND u.longitude IS NOT NULL " +
                    "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
                    "cos(radians(u.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(u.latitude)))) <= :radius " +
                    "ORDER BY (6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
                    "cos(radians(u.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                    "sin(radians(u.latitude))))")
    List<User> findNearbyBusinessUsers(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius,
            @Param("role") User.Role role);

    // 카카오 연동된 사용자 찾기
    List<User> findByKakaoLinkedTrue();

    // 전문 분야로 업체 검색
    @Query("SELECT u FROM User u WHERE u.role = 'BUSINESS' AND :specialty MEMBER OF u.specialties")
    List<User> findBusinessBySpecialty(@Param("specialty") String specialty);

    // 평점으로 정렬된 업체 목록
    @Query("SELECT u FROM User u WHERE u.role = 'BUSINESS' ORDER BY u.averageRating DESC")
    List<User> findBusinessOrderByRating();

    // 이름으로 유저 검색 (부분 일치)
    List<User> findByNameContaining(String name);

    // 업체명으로 검색 (부분 일치)
    List<User> findByBusinessNameContaining(String businessName);
}