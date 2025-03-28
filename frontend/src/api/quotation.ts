// api/quotation.ts
// 견적 요청 API

import apiClient from './client';

// 견적 요청 목록 가져오기
export const getQuotationRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/quotation/requests', { params });
    return response.data;
  } catch (error) {
    console.error('견적 요청 목록 가져오기 실패:', error);
    throw error;
  }
};

// 견적 요청 상세 정보 가져오기
export const getQuotationRequest = async (id: string) => {
  try {
    const response = await apiClient.get(`/quotation/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('견적 요청 상세 정보 가져오기 실패:', error);
    throw error;
  }
};

// 견적 요청하기
export const createQuotationRequest = async (requestData: any) => {
  try {
    const response = await apiClient.post('/quotation/requests', requestData);
    return response.data;
  } catch (error) {
    console.error('견적 요청 생성 실패:', error);
    throw error;
  }
};

// 견적 제안하기 (업체용)
export const createQuotationOffer = async (requestId: string, offerData: any) => {
  try {
    const response = await apiClient.post(`/quotation/requests/${requestId}/offers`, offerData);
    return response.data;
  } catch (error) {
    console.error('견적 제안 실패:', error);
    throw error;
  }
};

// 견적 수락하기 (고객용)
export const acceptQuotationOffer = async (requestId: string, offerId: string) => {
  try {
    const response = await apiClient.post(`/quotation/requests/${requestId}/offers/${offerId}/accept`);
    return response.data;
  } catch (error) {
    console.error('견적 수락 실패:', error);
    throw error;
  }
};