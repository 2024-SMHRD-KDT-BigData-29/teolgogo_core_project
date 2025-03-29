import apiClient from './client';
import { UserInfo } from './auth';

// 사용자 정보 가져오기
export const getUserProfile = async (userId: number): Promise<UserInfo> => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw error;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (userData: Partial<UserInfo>): Promise<UserInfo> => {
  try {
    const response = await apiClient.put('/api/auth/profile', userData);
    // 업데이트된 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    throw error;
  }
};

// 프로필 이미지 업데이트
export const updateProfileImage = async (imageFile: File): Promise<UserInfo> => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await apiClient.post('/api/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 업데이트된 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('프로필 이미지 업데이트 실패:', error);
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.post('/api/auth/password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    throw error;
  }
};

// 업체 정보 업데이트 (업체 회원용)
export const updateBusinessProfile = async (businessData: {
  businessName?: string;
  businessDescription?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
}): Promise<UserInfo> => {
  try {
    const response = await apiClient.put('/api/auth/business-profile', businessData);
    
    // 업데이트된 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('업체 정보 업데이트 실패:', error);
    throw error;
  }
};

// 사업자등록증 업로드 (업체 회원용)
export const uploadBusinessLicense = async (licenseFile: File): Promise<UserInfo> => {
  try {
    const formData = new FormData();
    formData.append('license', licenseFile);
    
    const response = await apiClient.post('/api/auth/business-license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 업데이트된 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('사업자등록증 업로드 실패:', error);
    throw error;
  }
};

// 가까운 업체 검색
export const findNearbyBusinesses = async (
  latitude: number, 
  longitude: number, 
  radius: number = 5, // 기본 반경 5km
  specialties?: string[]
): Promise<UserInfo[]> => {
  try {
    const response = await apiClient.get('/api/businesses/nearby', {
      params: {
        latitude,
        longitude,
        radius,
        specialties: specialties?.join(','),
      },
    });
    return response.data;
  } catch (error) {
    console.error('가까운 업체 검색 실패:', error);
    throw error;
  }
};

// 업체 상세 정보 조회
export const getBusinessDetails = async (businessId: number): Promise<{
  profile: UserInfo;
  reviewStats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
    popularTags: { tag: string; count: number }[];
  };
  services: {
    completed: number;
    inProgress: number;
  };
}> => {
  try {
    const response = await apiClient.get(`/api/businesses/${businessId}/details`);
    return response.data;
  } catch (error) {
    console.error('업체 상세 정보 조회 실패:', error);
    throw error;
  }
};