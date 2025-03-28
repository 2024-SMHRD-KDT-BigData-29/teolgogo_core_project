// app/chat/page.tsx
// 채팅방 목록 페이지

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getChatRooms } from '@/api/chat';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getUserProfile } from '@/api/auth';

interface ChatRoom {
  id: string;
  quotationId: string;
  businessName: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'BUSINESS';
}

export default function ChatRoomsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
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

  // 채팅방 목록 가져오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getChatRooms();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">채팅 목록</h1>
      
      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">아직 채팅방이 없습니다.</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            견적 요청으로 돌아가기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const isBusinessUser = user?.role === 'BUSINESS';
            const roomName = isBusinessUser ? room.customerName : room.businessName;
            
            return (
              <Link 
                key={room.id} 
                href={`/chat/${room.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 border"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{roomName}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(room.lastMessageTime).toLocaleString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-600 truncate">
                    {room.lastMessage}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}