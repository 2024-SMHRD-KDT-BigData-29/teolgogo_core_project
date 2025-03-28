package com.teolgogo.repository;

import com.teolgogo.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.customer.id = ?1 ORDER BY cr.createdAt DESC")
    List<ChatRoom> findByCustomerId(Long customerId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.business.id = ?1 ORDER BY cr.createdAt DESC")
    List<ChatRoom> findByBusinessId(Long businessId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.quoteRequest.id = ?1")
    Optional<ChatRoom> findByQuoteRequestId(Long quoteRequestId);

    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.customer.id = ?1 AND cr.business.id = ?2) OR (cr.customer.id = ?2 AND cr.business.id = ?1)")
    Optional<ChatRoom> findByCustomerIdAndBusinessId(Long userId1, Long userId2);
}