package com.teolgogo.repository;

import com.teolgogo.entity.PushSubscription;
import com.teolgogo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    /**
     * 사용자 ID로 모든 구독 정보 찾기
     */
    List<PushSubscription> findByUserId(Long userId);

    /**
     * 사용자 ID와 엔드포인트로 구독 정보 찾기
     */
    Optional<PushSubscription> findByUserIdAndEndpoint(Long userId, String endpoint);

    /**
     * 엔드포인트로 구독 정보 찾기
     */
    Optional<PushSubscription> findByEndpoint(String endpoint);

    /**
     * 특정 역할을 가진 사용자의 구독 정보 찾기
     */
    @Query("SELECT ps FROM PushSubscription ps WHERE ps.user.role = :role")
    List<PushSubscription> findByUserRole(@Param("role") User.Role role);

    /**
     * 특정 위치 반경 내의 업체 사용자 구독 정보 찾기
     */
    @Query(value = "SELECT ps.* FROM push_subscriptions ps " +
            "JOIN users u ON ps.user_id = u.id " +
            "WHERE u.role = 'BUSINESS' " +
            "AND u.notification_enabled = true " +
            "AND ST_Distance_Sphere(" +
            "    point(u.longitude, u.latitude), " +
            "    point(:longitude, :latitude)" +
            ") <= :radius * 1000", nativeQuery = true)
    List<PushSubscription> findNearbyBusinessSubscriptions(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius);

    /**
     * 사용자 ID로 구독 정보 삭제
     */
    void deleteByUserId(Long userId);
}