package com.teolgogo.dto;

import com.teolgogo.entity.QuoteItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteItemDTO {
    private Long id;
    private Long quoteRequestId;
    private String name;
    private String description;
    private Integer price;
    private QuoteItem.ItemType type;

    public static QuoteItemDTO fromEntity(QuoteItem item) {
        return QuoteItemDTO.builder()
                .id(item.getId())
                .quoteRequestId(item.getQuoteRequest() != null ? item.getQuoteRequest().getId() : null)
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .type(item.getType())
                .build();
    }
}