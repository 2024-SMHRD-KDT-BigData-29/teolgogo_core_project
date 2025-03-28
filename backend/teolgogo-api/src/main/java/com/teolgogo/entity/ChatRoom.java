package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방에 연결된 견적 요청 (하나의 견적 요청당 하나의 채팅방)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_request_id", nullable = false)
    private QuoteRequest quoteRequest;

    // 고객
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // 업체
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private User business;

    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;

    @Builder.Default
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        lastActivityAt = LocalDateTime.now();
    }

    // 마지막 활동 시간 업데이트
    public void updateLastActivity() {
        lastActivityAt = LocalDateTime.now();
    }
}