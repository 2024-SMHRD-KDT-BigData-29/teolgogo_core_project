// hooks/useChat.ts
// 채팅 소켓 연결을 위한 훅

'use client';

import { useState, useEffect, useCallback } from 'react';
import * as StompJs from '@stomp/stompjs';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export default function useChat(roomId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<StompJs.Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 소켓 연결 설정
  useEffect(() => {
    const newClient = new StompJs.Client({
      brokerURL: 'ws://localhost:8080/api/ws', // 웹소켓 엔드포인트
      connectHeaders: {
        'X-AUTH-TOKEN': localStorage.getItem('token') || '',
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 이벤트
    newClient.onConnect = (frame) => {
      setConnected(true);
      setError(null);
      
      // 채팅방 구독
      newClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body) as ChatMessage;
        setMessages((prev) => [...prev, receivedMessage]);
      });
      
      // 메시지 읽음 상태 갱신 구독
      newClient.subscribe(`/topic/chat/${roomId}/read`, (message) => {
        const { messageIds } = JSON.parse(message.body);
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      });
    };

    // 연결 실패 이벤트
    newClient.onStompError = (frame) => {
      setError(`채팅 연결 오류: ${frame.headers['message']}`);
      setConnected(false);
    };

    // 클라이언트 저장 및 연결 시도
    setClient(newClient);
    newClient.activate();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (newClient) {
        newClient.deactivate();
      }
    };
  }, [roomId]);

  // 메시지 전송 함수
  const sendMessage = useCallback(
    (content: string) => {
      if (!client || !connected) {
        setError('채팅 연결이 활성화되지 않았습니다.');
        return;
      }

      const message = {
        roomId,
        senderId: userId,
        content,
        timestamp: new Date().toISOString(),
      };

      client.publish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify(message),
      });
    },
    [client, connected, roomId, userId]
  );

  // 메시지 읽음 상태 업데이트 함수
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!client || !connected || messageIds.length === 0) {
        return;
      }

      client.publish({
        destination: `/app/chat/${roomId}/read`,
        body: JSON.stringify({ messageIds }),
      });
    },
    [client, connected, roomId]
  );

  return {
    messages,
    connected,
    error,
    sendMessage,
    markAsRead,
  };
}