// src/api/auth.ts
// 백엔드에서 구현한 인증 API와 통신하는 함수들을 제공합니다.
// 회원가입, 로그인, 로그아웃, 사용자 정보 조회 등의 기능이 포함되어 있으며,
// 특히 소셜 로그인 URL을 생성하는 함수도 포함되어 있습니다.

import apiClient from './client';

// 로그인 인터페이스
interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 인터페이스
interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CUSTOMER' | 'BUSINESS';
}

// 사용자 정보 인터페이스
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: string;
  businessName?: string;
  businessDescription?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  completedServices?: number;
  averageRating?: number;
}

// 소셜 로그인 인터페이스
interface SocialLoginOptions {
  provider: 'google' | 'kakao' | 'naver';
  redirectUri?: string;
}

// 회원가입 함수
export const signup = async (data: SignupRequest | { name: string, email: string, password: string }) => {
  try {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 로그인 함수
export const login = async (emailOrData: string | LoginRequest, password?: string) => {
  try {
    let requestData: LoginRequest;
    
    // 두 가지 함수 호출 방식 지원 (객체로 전달하거나 개별 인자로 전달)
    if (typeof emailOrData === 'string' && password) {
      requestData = { email: emailOrData, password };
    } else {
      requestData = emailOrData as LoginRequest;
    }
    
    const response = await apiClient.post('/api/auth/login', requestData);
    
    // 토큰 저장
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

// 로그아웃 함수
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // 추가 로그아웃 처리가 필요하면 여기에 구현
  // 예: 서버에 로그아웃 요청 보내기
};

// 사용자 정보 가져오기
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/auth/user');
    // 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 정보 업데이트
export const updateUserProfile = async (data: Partial<UserInfo>) => {
  try {
    const response = await apiClient.put('/api/auth/profile', data);
    // 업데이트된 사용자 정보 로컬 저장소에도 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    throw error;
  }
};

// 소셜 로그인 URL 생성 함수
export const getSocialLoginUrl = (providerOrOptions: 'google' | 'kakao' | 'naver' | SocialLoginOptions) => {
  // 두 가지 함수 호출 방식 지원
  let provider: string;
  let redirectUri: string;
  
  if (typeof providerOrOptions === 'string') {
    provider = providerOrOptions;
    // 백엔드 서버 URL (api 접두사 포함 확인)
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // baseUrl에 /api가 없으면 추가
    if (!baseUrl.endsWith('/api')) {
      baseUrl = `${baseUrl}/api`;
    }
    
    // 프론트엔드 리다이렉트 URL (인코딩 필요)
    redirectUri = encodeURIComponent(
      `${window.location.origin}/oauth2/redirect`
    );
    
    // OAuth2 인증 URL 생성
    return `${baseUrl}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}`;
  } else {
    // SocialLoginOptions 객체로 호출한 경우
    const options = providerOrOptions;
    provider = options.provider;
    redirectUri = options.redirectUri || encodeURIComponent(`${window.location.origin}/oauth2/redirect`);
    
    return `${apiClient.defaults.baseURL}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}`;
  }
};

// 소셜 로그인 연동
export const linkSocialAccount = async (provider: string) => {
  try {
    const response = await apiClient.post(`/api/auth/link/${provider}`);
    return response.data;
  } catch (error) {
    console.error('소셜 계정 연동 실패:', error);
    throw error;
  }
};

// 소셜 로그인 연동 해제
export const unlinkSocialAccount = async (provider: string) => {
  try {
    const response = await apiClient.post(`/api/auth/unlink/${provider}`);
    return response.data;
  } catch (error) {
    console.error('소셜 계정 연동 해제 실패:', error);
    throw error;
  }
};

// 현재 사용자 정보 가져오기 (getUserProfile과 동일한 기능, 이름만 다름)
export const getCurrentUser = async (): Promise<UserInfo> => {
  return getUserProfile();
};

export default {
  login,
  signup,
  logout,
  getUserProfile,
  getCurrentUser,
  updateUserProfile,
  getSocialLoginUrl,
  linkSocialAccount,
  unlinkSocialAccount
};