// src/api/auth.ts
// 백엔드에서 구현한 인증 API와 통신하는 함수들을 제공합니다.
// 회원가입, 로그인, 로그아웃, 사용자 정보 조회 등의 기능이 포함되어 있으며,
// 특히 소셜 로그인 URL을 생성하는 함수도 포함되어 있습니다.

import apiClient from './client';
import axios from 'axios';

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
  businessName?: string;
  businessDescription?: string;
  businessLicense?: string;
  // 약관 동의 필드 추가
  agreeTerms: boolean;
  agreePrivacy: boolean;
}
// 사용자 정보 인터페이스
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  nickname?: string; // 닉네임 필드 추가
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
    console.log('회원가입 요청 데이터:', data);
    // '/api' 접두사 제거 - baseURL에 이미 포함될 수 있음
    const response = await apiClient.post('/auth/signup', data);
    console.log('회원가입 성공 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    
    // 에러 상세 정보 출력
    if (axios.isAxiosError(error)) {
      // Axios 에러인 경우
      if (error.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 에러)
        console.error('에러 응답:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // 요청은 됐지만 응답이 없는 경우
        console.error('요청은 전송되었으나 응답이 없습니다:', error.request);
      } else {
        // 요청 설정 중 오류 발생
        console.error('요청 설정 중 오류:', error.message);
      }
    } else {
      // 일반 에러인 경우
      console.error('알 수 없는 오류:', error);
    }
    
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
    
    console.log('로그인 요청 데이터:', requestData);
    // '/api' 접두사 제거
    const response = await apiClient.post('/auth/login', requestData);
    console.log('로그인 성공 응답:', response.data);
    
    // 토큰 저장
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('로그인 오류 응답:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

// 로그아웃 함수
export const logout = async () => {
  try {
    // 백엔드에 로그아웃 요청 보내기 - '/api' 접두사 제거
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('로그아웃 API 호출 실패:', error);
    // API 호출에 실패해도 로컬 로그아웃은 진행
  } finally {
    // 로컬 스토리지에서 인증 관련 데이터 제거
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// 사용자 정보 가져오기
export const getUserProfile = async () => {
  try {
    // '/api' 접두사 제거
    const response = await apiClient.get('/auth/user');
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
    // '/api' 접두사 제거
    const response = await apiClient.put('/auth/profile', data);
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
    
    // baseUrl에 /api가 없으면 추가 - 이 부분은 필요한지 확인 필요
    // if (!baseUrl.endsWith('/api')) {
    //   baseUrl = `${baseUrl}/api`;
    // }
    
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
    // '/api' 접두사 제거
    const response = await apiClient.post(`/auth/link/${provider}`);
    return response.data;
  } catch (error) {
    console.error('소셜 계정 연동 실패:', error);
    throw error;
  }
};

// 소셜 로그인 연동 해제
export const unlinkSocialAccount = async (provider: string) => {
  try {
    // '/api' 접두사 제거
    const response = await apiClient.post(`/auth/unlink/${provider}`);
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