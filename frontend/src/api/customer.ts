// api/customer.ts
// 고객 API

import apiClient from './client';

// 고객의 견적 요청 목록 가져오기
export const getCustomerQuotations = async (params = {}) => {
  try {
    const response = await apiClient.get('/customer/quotations', { params });
    return response.data;
  } catch (error) {
    console.error('고객 견적 목록 가져오기 실패:', error);
    throw error;
  }
};

// 고객 프로필 정보 가져오기
export const getCustomerProfile = async () => {
  try {
    const response = await apiClient.get('/customer/profile');
    return response.data;
  } catch (error) {
    console.error('고객 프로필 가져오기 실패:', error);
    throw error;
  }
};

// 고객 프로필 정보 업데이트
export const updateCustomerProfile = async (profileData: any) => {
  try {
    const response = await apiClient.put('/customer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('고객 프로필 업데이트 실패:', error);
    throw error;
  }
};