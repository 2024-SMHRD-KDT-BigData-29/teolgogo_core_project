// app/chat/[roomId]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChatMessages, getChatRoomDetails } from '@/api/chat';
import useChat from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage } from '@/types/chat';

function isValidChatMessage(message: any): message is ChatMessage {
  return (
    message && 
    (typeof message.id === 'string' || typeof message.id === 'number') &&
    (typeof message.senderId === 'string' || typeof message.senderId === 'number') &&
    (typeof message.content === 'string')
  );
}

// 사용자 타입 정의
interface User {
  id: string | number;
  name: string;
  role: 'CUSTOMER' | 'BUSINESS';
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { isAuthenticated, user: authUser } = useAuth();
  
  // 상태 관리
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 인증 확인 및 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/chat/${roomId}`);
      return;
    }
    
    // 사용자 정보 설정
    if (authUser) {
      setUser(authUser as unknown as User);
    }
  }, [isAuthenticated, authUser, roomId, router]);

  // 채팅방 상세 정보 로드
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId || !isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await getChatRoomDetails(roomId as string);
        
        // API 응답 구조에 따라 처리
        if (response.room) {
          setRoomDetails(response.room);
          setOtherUser(response.otherUser);
          // 타입 변환 추가
          const messages = response.messages || [];
          setInitialMessages(messages as ChatMessage[]);
        } else {
          // 기존 API와의 호환성 유지
          const messagesData = await getChatMessages(roomId as string);
          // 타입 변환 추가
          const messages = messagesData.messages || [];
          setInitialMessages(messages as ChatMessage[]);
        }
      } catch (error: any) {
        console.error('채팅방 정보 로드 실패:', error);
        setError(error.response?.data?.message || '채팅방 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, isAuthenticated]);
  
  // 채팅 훅 연결
  const { messages: liveMessages, connected, error: socketError, sendMessage, markAsRead } = useChat(
    roomId as string,
    user?.id?.toString() || ''
  );
  
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollBottom(!isNearBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 초기 메시지와 실시간 메시지 병합
  const allMessages = [...initialMessages, ...liveMessages];
  
  // 새 메시지가 도착하면 화면 아래로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // 읽지 않은 메시지 표시
  useEffect(() => {
    if (!user || allMessages.length === 0) return;

    const unreadMessageIds = allMessages
      .filter(msg => {
        // 두 속성 중 하나라도 false면 읽지 않은 메시지
        // isRead와 read 속성 모두 확인 (API 호환성을 위함)
        const isUnread = (msg.isRead === false || (msg as any).read === false);
        return isUnread && msg.senderId !== user.id;
      })
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      // 타입 변환 추가
      markAsRead(unreadMessageIds as string[]);
    }
  }, [allMessages, user, markAsRead]);
  
  // 하단으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송 처리
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !connected) return;
    
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };
  
  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };
  
  // 메시지 시간 포맷팅
  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // 메시지 날짜 그룹화 (날짜 구분선 표시용)
  const getMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // 날짜별 메시지 그룹화
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    allMessages.forEach(message => {
      // timestamp와 sentAt 속성 모두 처리 (API 호환성)
      const timestamp = message.timestamp || (message as any).sentAt || '';
      const date = timestamp ? getMessageDate(timestamp) : '알 수 없음';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          채팅 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="bg-white shadow-md rounded-lg flex flex-col flex-1">
        {/* 채팅방 헤더 */}
        <div className="border-b p-4 flex items-center">
          <button 
            onClick={() => router.push('/chat')}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold flex items-center">
            {connected ? (
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            )}
            {otherUser ? otherUser.name : '채팅'}
          </h1>
          {socketError && <p className="text-sm text-red-500 ml-2">{socketError}</p>}
        </div>
        
        {/* 메시지 목록 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {Object.entries(messageGroups).map(([date, messagesInDay]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <div className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {date}
                </div>
              </div>
              
              {messagesInDay.map((message, index) => {
                const isMe = message.senderId === user?.id;
                // timestamp와 sentAt 속성 모두 처리 (API 호환성)
                const timestamp = message.timestamp || (message as any).sentAt || '';
                // isRead와 read 속성 모두 처리 (API 호환성)
                const isRead = message.isRead !== undefined ? message.isRead : 
                              (message as any).read !== undefined ? (message as any).read : false;
                
                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isMe ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`text-xs mt-1 flex items-center ${isMe ? 'text-blue-100 justify-end' : 'text-gray-500'}`}>
                        <span>{formatMessageTime(timestamp)}</span>
                        {isMe && <span className="ml-2">{isRead ? '읽음' : '안읽음'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 메시지 입력 */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex">
            <textarea
              className="flex-1 border rounded-l-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!connected}
              rows={2}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition disabled:bg-gray-400"
              disabled={!connected || !inputMessage.trim()}
            >
              전송
            </button>
          </form>
        </div>
      </div>
      
      {/* 스크롤 하단 버튼 */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 bg-gray-700 text-white rounded-full p-2 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}