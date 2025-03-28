package com.teolgogo.controller;

import com.teolgogo.dto.ChatMessageDTO;
import com.teolgogo.dto.ChatRoomDTO;
import com.teolgogo.entity.User;
import com.teolgogo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    // 채팅방 목록 조회
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getChatRooms(@AuthenticationPrincipal User user) {
        List<ChatRoomDTO> chatRooms = chatService.getChatRooms(user.getId());
        return ResponseEntity.ok(chatRooms);
    }

    // 채팅방 상세 조회 (메시지 포함)
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> getChatRoomDetails(
            @AuthenticationPrincipal User user,
            @PathVariable Long roomId) {

        Map<String, Object> response = chatService.getChatRoomDetails(user.getId(), roomId);
        return ResponseEntity.ok(response);
    }

    // 채팅방 생성 (견적 수락 후 자동 생성될 수도 있지만, 수동 생성도 가능)
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDTO> createChatRoom(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Long> request) {

        Long quoteRequestId = request.get("quoteRequestId");
        Long businessId = request.get("businessId");

        ChatRoomDTO chatRoom = chatService.createChatRoom(user.getId(), quoteRequestId, businessId);
        return ResponseEntity.ok(chatRoom);
    }

    // WebSocket으로 메시지 전송
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable Long roomId, @Payload ChatMessageDTO message) {
        ChatMessageDTO savedMessage = chatService.saveMessage(message);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
    }

    // 메시지 읽음 처리
    @MessageMapping("/chat/{roomId}/read")
    public void markMessagesAsRead(
            @DestinationVariable Long roomId,
            @Payload Map<String, List<Long>> payload) {

        List<Long> messageIds = payload.get("messageIds");
        chatService.markMessagesAsRead(roomId, messageIds);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/read", payload);
    }

    // 채팅 메시지 일반 API를 통해 전송 (WebSocket이 안될 때 대체용)
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageDTO> sendMessageViaApi(
            @AuthenticationPrincipal User user,
            @PathVariable Long roomId,
            @RequestBody Map<String, String> request) {

        String content = request.get("content");
        ChatMessageDTO message = ChatMessageDTO.builder()
                .roomId(roomId)
                .senderId(user.getId())
                .content(content)
                .build();

        ChatMessageDTO savedMessage = chatService.saveMessage(message);

        // WebSocket으로도 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);

        return ResponseEntity.ok(savedMessage);
    }
}