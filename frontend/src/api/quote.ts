// src/api/quote.ts
// 견적 요청 API 함수 : 먼저 백엔드와 통신하기 위한 API 함수를 만듭니다.

import apiClient from './client';

// 견적 요청 생성
export const createQuoteRequest = async (quoteData: {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  addressDetail: string;
  items: Array<{
    name: string;
    quantity: number;
    description: string;
  }>;
}) => {
  try {
    const response = await apiClient.post('/quote-requests', quoteData);
    return response.data;
  } catch (error) {
    console.error('견적 요청 생성 실패:', error);
    throw error;
  }
};

// 내 견적 요청 목록 조회
export const getMyQuoteRequests = async () => {
  try {
    const response = await apiClient.get('/quote-requests/my');
    return response.data;
  } catch (error) {
    console.error('견적 요청 목록 조회 실패:', error);
    throw error;
  }
};

// 견적 요청 상세 조회
export const getQuoteRequestDetail = async (id: number) => {
  try {
    const response = await apiClient.get(`/quote-requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('견적 요청 상세 조회 실패:', error);
    throw error;
  }
};