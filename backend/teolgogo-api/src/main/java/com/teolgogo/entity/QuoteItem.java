package com.teolgogo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "quote_items")
public class QuoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_request_id", nullable = false)
    private QuoteRequest quoteRequest;

    private String name; // 서비스 이름
    private String description; // 설명
    private Integer price; // 가격

    @Enumerated(EnumType.STRING)
    private ItemType type; // 아이템 유형

    public enum ItemType {
        BASIC_GROOMING, SPECIAL_CARE, BATH, NAIL_TRIM, EAR_CLEANING, TEETH_BRUSHING,
        STYLING, DESHEDDING, FLEA_TREATMENT, CUSTOM
    }
}