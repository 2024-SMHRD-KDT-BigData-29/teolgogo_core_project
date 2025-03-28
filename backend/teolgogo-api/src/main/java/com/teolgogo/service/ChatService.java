package com.teolgogo.service;

import com.teolgogo.dto.ChatMessageDTO;
import com.teolgogo.dto.ChatRoomDTO;
import com.teolgogo.entity.ChatMessage;
import com.teolgogo.entity.ChatRoom;
import com.teolgogo.entity.QuoteRequest;
import com.teolgogo.entity.User;
import com.teolgogo.repository.ChatMessageRepository;
import com.teolgogo.repository.ChatRoomRepository;
import com.teolgogo.repository.QuoteRequestRepository;
import com.teolgogo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatService(
            ChatRoomRepository chatRoomRepository,
            ChatMessageRepository chatMessageRepository,
            QuoteRequestRepository quoteRequestRepository,
            UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.userRepository = userRepository;
    }

    // 사용자의 채팅방 목록 조회
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getChatRooms(Long userId) {
        // 이 메서드는 ChatRoomRepository에 없으므로 대체 방법 사용
        List<ChatRoom> chatRooms = chatRoomRepository.findByCustomerId(userId);
        chatRooms.addAll(chatRoomRepository.findByBusinessId(userId));

        return chatRooms.stream()
                .map(room -> convertToChatRoomDTO(room, userId))
                .collect(Collectors.toList());
    }

    private ChatRoomDTO convertToChatRoomDTO(ChatRoom room, Long userId) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setId(room.getId());
        dto.setQuoteRequestId(room.getQuoteRequest().getId());
        dto.setCustomerId(room.getCustomer().getId());
        dto.setCustomerName(room.getCustomer().getName());
        dto.setBusinessId(room.getBusiness().getId());
        dto.setBusinessName(room.getBusiness().getName());
        dto.setLastMessageTime(room.getLastActivityAt());

        // 마지막 메시지 설정
        if (!room.getMessages().isEmpty()) {
            ChatMessage lastMessage = room.getMessages().stream()
                    .sorted((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()))
                    .findFirst()
                    .orElse(null);

            if (lastMessage != null) {
                dto.setLastMessageContent(lastMessage.getContent());
            }
        }

        // 안 읽은 메시지 수 계산
        long unreadCount = room.getMessages().stream()
                .filter(message -> !message.isRead() && !message.getSender().getId().equals(userId))
                .count();

        dto.setUnreadCount((int) unreadCount);

        return dto;
    }

    // 채팅방 상세 조회
    @Transactional(readOnly = true)
    public Map<String, Object> getChatRoomDetails(Long userId, Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));

        // 접근 권한 확인
        if (!chatRoom.getCustomer().getId().equals(userId) && !chatRoom.getBusiness().getId().equals(userId)) {
            throw new AccessDeniedException("해당 채팅방에 접근할 권한이 없습니다.");
        }

        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("room", convertToChatRoomDTO(chatRoom, userId));

        // 메시지 목록
        List<ChatMessageDTO> messages = chatRoom.getMessages().stream()
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .map(this::convertToChatMessageDTO)
                .collect(Collectors.toList());

        response.put("messages", messages);

        // 상대방 정보
        User otherUser = userId.equals(chatRoom.getCustomer().getId())
                ? chatRoom.getBusiness()
                : chatRoom.getCustomer();

        Map<String, Object> otherUserInfo = new HashMap<>();
        otherUserInfo.put("id", otherUser.getId());
        otherUserInfo.put("name", otherUser.getName());
        // profileImage 필드가 없을 수 있으므로 조건부 추가
        if (otherUser.getProfileImage() != null) {
            otherUserInfo.put("profileImage", otherUser.getProfileImage());
        } else {
            otherUserInfo.put("profileImage", "");
        }

        response.put("otherUser", otherUserInfo);

        return response;
    }

    private ChatMessageDTO convertToChatMessageDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setRoomId(message.getChatRoom().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }

    // 채팅방 생성
    @Transactional
    public ChatRoomDTO createChatRoom(Long customerId, Long quoteRequestId, Long businessId) {
        // 견적 요청 조회
        QuoteRequest quoteRequest = quoteRequestRepository.findById(quoteRequestId)
                .orElseThrow(() -> new EntityNotFoundException("견적 요청을 찾을 수 없습니다."));

        // 사용자 정보 조회
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객 정보를 찾을 수 없습니다."));

        User business = userRepository.findById(businessId)
                .orElseThrow(() -> new EntityNotFoundException("업체 정보를 찾을 수 없습니다."));

        // 견적 요청의 고객이 맞는지 확인
        if (!quoteRequest.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("견적 요청의 고객만 채팅방을 생성할 수 있습니다.");
        }

        // 이미 채팅방이 있는지 확인
        Optional<ChatRoom> existingRoomOpt = chatRoomRepository.findByQuoteRequestId(quoteRequestId);
        if (existingRoomOpt.isPresent()) {
            return convertToChatRoomDTO(existingRoomOpt.get(), customerId);
        }

        // 새 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .quoteRequest(quoteRequest)
                .customer(customer)
                .business(business)
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        // 시스템 메시지 추가
        ChatMessage systemMessage = ChatMessage.builder()
                .chatRoom(savedRoom)
                .sender(customer) // 시스템 메시지지만 고객 이름으로 표시
                .content("채팅방이 개설되었습니다. 서비스에 대해 자유롭게 상담해보세요!")
                .read(true)
                .timestamp(LocalDateTime.now())
                .build();

        chatMessageRepository.save(systemMessage);

        return convertToChatRoomDTO(savedRoom, customerId);
    }

    // 채팅 메시지 저장
    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO messageDTO) {
        ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));

        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 접근 권한 확인
        if (!chatRoom.getCustomer().getId().equals(sender.getId()) &&
                !chatRoom.getBusiness().getId().equals(sender.getId())) {
            throw new AccessDeniedException("해당 채팅방에 메시지를 보낼 권한이 없습니다.");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(messageDTO.getContent())
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // 채팅방 마지막 활동 시간 업데이트
        chatRoom.updateLastActivity();
        chatRoomRepository.save(chatRoom);

        return convertToChatMessageDTO(savedMessage);
    }

    // 메시지 읽음 처리
    @Transactional
    public void markMessagesAsRead(Long roomId, List<Long> messageIds) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("채팅방을 찾을 수 없습니다."));

        List<ChatMessage> messages = chatMessageRepository.findAllById(messageIds);

        messages.forEach(message -> {
            message.setRead(true);
            chatMessageRepository.save(message);
        });
    }
}