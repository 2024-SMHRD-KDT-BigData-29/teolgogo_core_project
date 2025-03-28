// api/business.ts
// 비즈니스 API

import apiClient from './client';

// 업체의 견적 요청/제안 목록 가져오기
export const getBusinessQuotations = async (params = {}) => {
  try {
    const response = await apiClient.get('/business/quotations', { params });
    return response.data;
  } catch (error) {
    console.error('업체 견적 목록 가져오기 실패:', error);
    throw error;
  }
};

// 업체 프로필 정보 가져오기
export const getBusinessProfile = async () => {
  try {
    const response = await apiClient.get('/business/profile');
    return response.data;
  } catch (error) {
    console.error('업체 프로필 가져오기 실패:', error);
    throw error;
  }
};

// 업체 프로필 정보 업데이트
export const updateBusinessProfile = async (profileData: any) => {
  try {
    const response = await apiClient.put('/business/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('업체 프로필 업데이트 실패:', error);
    throw error;
  }
};