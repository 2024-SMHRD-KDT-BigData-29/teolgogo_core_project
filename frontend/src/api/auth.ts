// src/api/auth.ts
// 백엔드에서 구현한 인증 API와 통신하는 함수들을 제공합니다. 
// 회원가입, 로그인, 로그아웃, 사용자 정보 조회 등의 기능이 포함되어 
// 있으며, 특히 소셜 로그인 URL을 생성하는 함수도 포함되어 있습니다.

import apiClient from './client';

// 회원가입 함수
export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 로그인 함수
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    
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
  
  // 추가 로그아웃 처리가 필요하면 여기에 구현
  // 예: 서버에 로그아웃 요청 보내기
};

// 사용자 정보 가져오기
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    throw error;
  }
};

// 소셜 로그인 URL 생성 함수
export const getSocialLoginUrl = (provider: 'google' | 'kakao' | 'naver') => {
  // 백엔드 서버 URL (api 접두사 포함 확인)
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  // baseUrl에 /api가 없으면 추가
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  
  // 프론트엔드 리다이렉트 URL (인코딩 필요)
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/oauth2/redirect`
  );
  
  // OAuth2 인증 URL 생성
  return `${baseUrl}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}`;
};