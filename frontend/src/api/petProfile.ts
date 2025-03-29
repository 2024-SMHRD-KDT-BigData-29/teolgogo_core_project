// src/api/petProfile.ts
// 반려동물 프로필 관련 API 호출 함수 모음

import apiClient from './client';
import { 
  PetProfile, 
  CreatePetProfileRequest, 
  UpdatePetProfileRequest, 
  GroomingHistory 
} from '@/types/petProfile';

// 사용자의 모든 반려동물 프로필 조회
export const getUserPetProfiles = async (): Promise<PetProfile[]> => {
  try {
    const response = await apiClient.get('/api/pet-profiles');
    return response.data;
  } catch (error) {
    console.error('반려동물 프로필 목록 조회 실패:', error);
    throw error;
  }
};

// 특정 반려동물 프로필 조회
export const getPetProfile = async (petProfileId: number): Promise<PetProfile> => {
  try {
    const response = await apiClient.get(`/api/pet-profiles/${petProfileId}`);
    return response.data;
  } catch (error) {
    console.error('반려동물 프로필 조회 실패:', error);
    throw error;
  }
};

// 반려동물 프로필 생성
export const createPetProfile = async (profileData: CreatePetProfileRequest): Promise<PetProfile> => {
  try {
    // 이미지 파일이 있는 경우 FormData로 처리
    if (profileData.imageFile) {
      const formData = new FormData();
      
      // 프로필 데이터를 JSON으로 변환하여 추가 (이미지 제외)
      const { imageFile, ...profileDataWithoutImage } = profileData;
      formData.append('profileData', JSON.stringify(profileDataWithoutImage));
      
      // 이미지 파일 추가
      formData.append('profileImage', imageFile);
      
      const response = await apiClient.post('/api/pet-profiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // 이미지가 없는 경우 일반 JSON 요청
      const response = await apiClient.post('/api/pet-profiles', profileData);
      return response.data;
    }
  } catch (error) {
    console.error('반려동물 프로필 생성 실패:', error);
    throw error;
  }
};

// 반려동물 프로필 업데이트
export const updatePetProfile = async (
  petProfileId: number, 
  profileData: UpdatePetProfileRequest
): Promise<PetProfile> => {
  try {
    // 이미지 파일이 있는 경우 FormData로 처리
    if (profileData.imageFile) {
      const formData = new FormData();
      
      // 프로필 데이터를 JSON으로 변환하여 추가 (이미지 제외)
      const { imageFile, ...profileDataWithoutImage } = profileData;
      formData.append('profileData', JSON.stringify(profileDataWithoutImage));
      
      // 이미지 파일 추가
      formData.append('profileImage', imageFile);
      
      const response = await apiClient.put(`/api/pet-profiles/${petProfileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // 이미지가 없는 경우 일반 JSON 요청
      const response = await apiClient.put(`/api/pet-profiles/${petProfileId}`, profileData);
      return response.data;
    }
  } catch (error) {
    console.error('반려동물 프로필 업데이트 실패:', error);
    throw error;
  }
};

// 반려동물 프로필 삭제
export const deletePetProfile = async (petProfileId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/pet-profiles/${petProfileId}`);
  } catch (error) {
    console.error('반려동물 프로필 삭제 실패:', error);
    throw error;
  }
};

// 반려동물 미용 히스토리 조회
export const getPetGroomingHistory = async (petProfileId: number): Promise<GroomingHistory[]> => {
  try {
    const response = await apiClient.get(`/api/pet-profiles/${petProfileId}/grooming-history`);
    return response.data;
  } catch (error) {
    console.error('반려동물 미용 히스토리 조회 실패:', error);
    throw error;
  }
};

// 반려동물 프로필 이미지 업데이트
export const updatePetProfileImage = async (
  petProfileId: number, 
  imageFile: File
): Promise<PetProfile> => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await apiClient.post(`/api/pet-profiles/${petProfileId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('반려동물 프로필 이미지 업데이트 실패:', error);
    throw error;
  }
};

// 견적 요청 시 반려동물 프로필 선택을 위한 간단한 목록 조회
export const getPetProfilesForQuote = async (): Promise<{ id: number; name: string; type: string; breed: string; imageUrl?: string; }[]> => {
  try {
    const response = await apiClient.get('/api/pet-profiles/list-for-quote');
    return response.data;
  } catch (error) {
    console.error('견적용 반려동물 프로필 목록 조회 실패:', error);
    throw error;
  }
};