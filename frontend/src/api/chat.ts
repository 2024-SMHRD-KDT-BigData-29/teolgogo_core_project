// api/chat.ts
// 채팅 기능 구현 (소켓 연결) : 업주와 고객 간 채팅 기능

import apiClient from './client';

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
export const getChatMessages = async (roomId: string) => {
  try {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  } catch (error) {
    console.error('채팅 메시지 가져오기 실패:', error);
    throw error;
  }
};

// 채팅방 생성하기
export const createChatRoom = async (quotationId: string) => {
  try {
    const response = await apiClient.post('/chat/rooms', { quotationId });
    return response.data;
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    throw error;
  }
};