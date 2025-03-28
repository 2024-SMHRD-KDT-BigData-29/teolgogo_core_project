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
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private User business;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_response_id", nullable = false)
    private QuoteResponse quoteResponse;

    private Integer rating; // 1-5 점 평점

    @Column(columnDefinition = "TEXT")
    private String content; // 리뷰 내용

    @ElementCollection
    @CollectionTable(name = "review_tags", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>(); // 태그 (예: #친절해요, #깔끔해요)

    private Boolean isPublic; // 공개 여부

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isPublic == null) {
            isPublic = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}