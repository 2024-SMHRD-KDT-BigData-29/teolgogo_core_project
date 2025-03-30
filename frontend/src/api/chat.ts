// src/api/chat.ts
// 채팅 기능 구현 (소켓 연결) : 업주와 고객 간 채팅 기능

import apiClient from './client';
// 먼저 stompjs 패키지 설치 필요
// npm install @stomp/stompjs
// 또는
// yarn add @stomp/stompjs
import { Client, Frame, Message } from '@stomp/stompjs'; // 필요한 타입 import

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id?: number | string;
  roomId: number | string;
  senderId: number | string;
  senderName?: string;
  content: string;
  isRead?: boolean;  // 현재 사용 중인 속성
  read?: boolean;    // 이전 API와의 호환성을 위한 속성
  timestamp?: string;
  sentAt?: string;   // 이전 API와의 호환성을 위한 속성
}

// 채팅방 인터페이스
export interface ChatRoom {
  id: number | string;
  quoteRequestId?: number | string;
  quotationId?: string; // 이전 버전과의 호환성을 위해
  customerId?: number | string;
  customerName?: string;
  businessId?: number | string;
  businessName?: string;
  lastMessageContent?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// 채팅방 상세 조회 응답 인터페이스
export interface ChatRoomDetails {
  room: ChatRoom;
  messages: ChatMessage[];
  otherUser?: {
    id: number | string;
    name: string;
    profileImage?: string;
  };
}

// WebSocket 클라이언트
let stompClient: Client | null = null;

// WebSocket 연결 함수
export const connectWebSocket = (token: string, onMessageCallback?: (message: ChatMessage) => void) => {
  if (stompClient) {
    disconnectWebSocket();
  }

  // WebSocket 클라이언트 생성
  stompClient = new Client({
    brokerURL: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/ws'}`,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    // 타입 명시
    debug: function (str: string) {
      console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  // 연결 성공 시 콜백
  stompClient.onConnect = function () {
    console.log('WebSocket 연결 성공');
  };

  // 에러 발생 시 콜백
  stompClient.onStompError = function (frame: Frame) {
    console.error('STOMP 에러:', frame.headers['message']);
    console.error('추가 상세정보:', frame.body);
  };

  // WebSocket 연결 시작
  stompClient.activate();

  return stompClient;
};

// WebSocket 연결 해제 함수
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('WebSocket 연결 해제');
  }
};

// 채팅방 구독 함수
export const subscribeToChatRoom = (
  roomId: number | string,
  onMessageReceived: (message: ChatMessage) => void,
  onMessageRead?: (messageIds: (number | string)[]) => void
) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return;
  }

  // 채팅 메시지 구독
  const messageSubscription = stompClient.subscribe(`/topic/chat/${roomId}`, (message: Message) => {
    const receivedMessage = JSON.parse(message.body) as ChatMessage;
    onMessageReceived(receivedMessage);
  });

  // 메시지 읽음 상태 구독
  const readSubscription = onMessageRead 
    ? stompClient.subscribe(`/topic/chat/${roomId}/read`, (message: Message) => {
        const payload = JSON.parse(message.body);
        if (payload.messageIds) {
          onMessageRead(payload.messageIds);
        }
      })
    : null;

  // 구독 해제 함수 반환
  return () => {
    messageSubscription.unsubscribe();
    if (readSubscription) {
      readSubscription.unsubscribe();
    }
  };
};

// 메시지 전송 함수 (WebSocket)
export const sendChatMessage = (message: ChatMessage) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return false;
  }

  stompClient.publish({
    destination: `/app/chat/${message.roomId}/send`,
    body: JSON.stringify(message),
  });

  return true;
};

// 메시지 읽음 처리 함수 (WebSocket)
export const markMessagesAsRead = (roomId: number | string, messageIds: (number | string)[]) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return false;
  }

  stompClient.publish({
    destination: `/app/chat/${roomId}/read`,
    body: JSON.stringify({
      messageIds: messageIds,
    }),
  });

  return true;
};

// 일반 API를 통한 메시지 전송 (WebSocket 연결이 불안정할 때 사용)
export const sendChatMessageViaApi = async (roomId: number | string, content: string) => {
  try {
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    throw error;
  }
};

// 채팅방 목록 가져오기
export const getChatRooms = async () => {
  try {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  } catch (error) {
    console.error('채팅방 목록 가져오기 실패:', error);
    throw error;
  }
};

// 채팅 메시지 가져오기
export const getChatMessages = async (roomId: string | number) => {
  try {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  } catch (error) {
    console.error('채팅 메시지 가져오기 실패:', error);
    throw error;
  }
};

// 채팅방 상세 조회
export const getChatRoomDetails = async (roomId: number | string): Promise<ChatRoomDetails> => {
  try {
    const response = await apiClient.get(`/chat/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅방 상세 조회 실패:', error);
    throw error;
  }
};

// 채팅방 생성하기
export const createChatRoom = async (quotationIdOrRequestId: string | number, businessId?: number | string) => {
  try {
    // 새 API 형식 (quoteRequestId와 businessId를 받는 경우)
    if (businessId !== undefined) {
      const response = await apiClient.post('/chat/rooms', {
        quoteRequestId: quotationIdOrRequestId,
        businessId: businessId,
      });
      return response.data;
    } 
    // 구 API 형식 (quotationId만 받는 경우)
    else {
      const response = await apiClient.post('/chat/rooms', { 
        quotationId: quotationIdOrRequestId 
      });
      return response.data;
    }
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    throw error;
  }
};

export default {
  getChatRooms,
  getChatMessages,
  getChatRoomDetails,
  createChatRoom,
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChatRoom,
  sendChatMessage,
  markMessagesAsRead,
  sendChatMessageViaApi
};