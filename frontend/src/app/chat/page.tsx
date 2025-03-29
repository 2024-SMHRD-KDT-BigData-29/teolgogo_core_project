// app/chat/page.tsx
// 채팅방 목록 페이지

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getChatRooms } from '@/api/chat';
import { getUserProfile } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

// 채팅방 타입 정의
interface ChatRoom {
  id: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  businessId: string;
  businessName: string;
  lastMessageContent?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// 사용자 타입 정의
interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'BUSINESS';
}

export default function ChatRoomsPage() {
  const { isAuthenticated, user: authUser } = useAuth();
  const router = useRouter();
  
  // 채팅방 목록 상태
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
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
  
  useEffect(() => {
    // 비로그인 상태인 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/chat');
      return;
    }
    
    fetchChatRooms();
  }, [isAuthenticated, router]);
  
  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getChatRooms();
      // 데이터 구조 처리 (rooms 필드가 있는지 확인)
      const roomsData = response.rooms || response;
      
      // 최근 메시지 시간 기준으로 정렬
      const sortedRooms = roomsData.sort((a: ChatRoom, b: ChatRoom) => {
        return new Date(b.lastMessageTime || '0').getTime() - new Date(a.lastMessageTime || '0').getTime();
      });
      
      setChatRooms(sortedRooms);
    } catch (error: any) {
      console.error('채팅방 목록 조회 실패:', error);
      setError(error.response?.data?.message || '채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 상대방 정보 가져오기
  const getOtherUserInfo = (room: ChatRoom) => {
    const currentUserId = user?.id || authUser?.id;
    const isCustomer = currentUserId === room.customerId;
    
    return {
      id: isCustomer ? room.businessId : room.customerId,
      name: isCustomer ? room.businessName : room.customerName,
    };
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // 오늘인 경우 시간만 표시
      return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } else if (diffDays < 7) {
      // 일주일 이내인 경우 요일 표시
      return new Intl.DateTimeFormat('ko-KR', {
        weekday: 'short',
      }).format(date);
    } else {
      // 일주일 이상인 경우 날짜 표시
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">채팅 목록</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {chatRooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-4">채팅 내역이 없습니다.</h2>
          <p className="text-gray-500 mb-4">
            견적 요청 및 견적 제안을 통해 상대방과 채팅을 시작해보세요.
          </p>
          <Link 
            href="/quotes"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            견적 요청 목록으로 이동
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {chatRooms.map((room) => {
              const otherUser = getOtherUserInfo(room);
              
              return (
                <li key={room.id} className="hover:bg-gray-50">
                  <Link href={`/chat/${room.id}`} className="block">
                    <div className="px-6 py-5 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                          {otherUser.name ? otherUser.name.charAt(0) : '?'}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{otherUser.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(room.lastMessageTime)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {room.lastMessageContent || room.lastMessage || '새로운 채팅방이 개설되었습니다.'}
                          </p>
                          {(room.unreadCount && room.unreadCount > 0) && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}