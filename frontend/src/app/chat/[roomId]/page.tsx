// app/chat/[roomId]/page.tsx
// 채팅 페이지 컴포넌트

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getChatMessages } from '@/api/chat';
import useChat from '@/hooks/useChat';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getUserProfile } from '@/api/auth';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'BUSINESS';
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 초기 메시지 로드
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getChatMessages(roomId as string);
        setInitialMessages(data.messages || []);
      } catch (error) {
        console.error('채팅 메시지 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  // 채팅 훅 연결
  const { messages: liveMessages, connected, error, sendMessage, markAsRead } = useChat(
    roomId as string,
    user?.id || ''
  );

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
      .filter(msg => !msg.isRead && msg.senderId !== user.id)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [allMessages, user, markAsRead]);

  // 메시지 전송 처리
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !connected) return;
    
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="bg-white shadow-md rounded-lg flex flex-col flex-1">
        {/* 채팅방 헤더 */}
        <div className="border-b p-4">
          <h1 className="text-lg font-semibold">
            {connected ? (
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            )}
            채팅
          </h1>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {allMessages.length === 0 ? (
            <p className="text-center text-gray-500 my-8">채팅을 시작해보세요.</p>
          ) : (
            allMessages.map((message, index) => {
              const isMe = message.senderId === user?.id;
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
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {isMe && <span className="ml-2">{message.isRead ? '읽음' : '안읽음'}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 메시지 입력 */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={!connected}
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
    </div>
  );
}