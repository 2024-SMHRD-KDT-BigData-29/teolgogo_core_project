package com.teolgogo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private Long quoteRequestId;
    private Long customerId;
    private String customerName;
    private Long businessId;
    private String businessName;
    private LocalDateTime lastMessageTime;
    private String lastMessageContent;
    private int unreadCount;
    private List<ChatMessageDTO> messages;
}