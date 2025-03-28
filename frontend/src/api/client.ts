// src/api/client.ts
// 백엔드와 통신하기 위한 API 클라이언트
// 백엔드 API와 통신하기 위한 axios 클라이언트를 설정합니다. 
// 요청 시 자동으로 인증 토큰을 헤더에 추가하고, 토큰이 만료되면 
// 리프레시 토큰을 사용해 새 토큰을 요청하는 인터셉터를 포함합니다.

import axios from 'axios';

// API 기본 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰이 있으면 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러(인증 실패)이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = response.data;
        
        // 새 토큰 저장
        localStorage.setItem('token', accessToken);
        
        // 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // 로그인 페이지로 리디렉션
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;