// src/types/chat.ts

// 채팅 메시지 타입 (통합 버전)
export interface ChatMessage {
    id: string | number;
    roomId: string | number;
    senderId: string | number;
    content: string;
    
    // 백엔드 API 응답에 맞게 모든 가능한 필드 포함
    timestamp?: string;
    sentAt?: string;
    read?: boolean;
    isRead?: boolean;
  }
  
  // 채팅방 타입
  export interface ChatRoom {
    id: string | number;
    quotationId?: string | number;
    quoteRequestId?: string | number;
    customerId: string | number;
    customerName: string;
    businessId: string | number;
    businessName: string;
    lastMessage?: string;
    lastMessageContent?: string;
    lastMessageTime?: string;
    unreadCount: number;
  }