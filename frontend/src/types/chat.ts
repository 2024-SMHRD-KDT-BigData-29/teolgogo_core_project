// src/types/chat.ts

// 채팅 메시지 타입 (통합 버전)
export interface ChatMessage {
    id: string | number;
    roomId: string | number;
    senderId: string | number;
    senderName?: string;
    content: string;
    
    // 필수 타임스탬프 
    timestamp: string;
    
    // 읽음 여부 필드
    isRead: boolean;
    
    // 이전 버전과의 호환성을 위한 필드들
    sentAt?: string;
    read?: boolean;
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