package com.teolgogo.repository;

import com.teolgogo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long roomId);

    List<ChatMessage> findByChatRoomIdAndSenderIdNotAndReadFalse(Long roomId, Long senderId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = ?1 AND m.sender.id <> ?2 AND m.read = false")
    int countUnreadMessages(Long roomId, Long userId);

    void deleteByChatRoomId(Long roomId);
}