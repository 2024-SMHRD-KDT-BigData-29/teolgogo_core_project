// src/api/client.ts
// 백엔드와 통신하기 위한 개선된 API 클라이언트
// 오프라인 지원, 토큰 갱신, 에러 핸들링, 로딩 인디케이터를 포함

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandling';

// API 기본 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 요청 중인 토큰 갱신 Promise를 저장
let refreshTokenPromise: Promise<string> | null = null;

// 로딩 상태를 추적하는 이벤트
const loadingEvents = {
  // 요청 시작 이벤트 콜백
  onRequestStart: null as ((url: string) => void) | null,
  // 요청 종료 이벤트 콜백
  onRequestEnd: null as ((url: string) => void) | null,
  // 글로벌 에러 핸들러
  onError: null as ((error: unknown) => void) | null,
};

// 현재 진행 중인 요청 수
let pendingRequests = 0;

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 타임아웃 설정 (15초)
  timeout: 15000,
});

// 로딩 이벤트 설정 함수
export const setLoadingEvents = (events: {
  onRequestStart?: (url: string) => void;
  onRequestEnd?: (url: string) => void;
  onError?: (error: unknown) => void;
}) => {
  if (events.onRequestStart) loadingEvents.onRequestStart = events.onRequestStart;
  if (events.onRequestEnd) loadingEvents.onRequestEnd = events.onRequestEnd;
  if (events.onError) loadingEvents.onError = events.onError;
};

// 요청 인터셉터: 토큰이 있으면 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      // 오프라인 상태 확인
      if (!navigator.onLine) {
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort(new Error('오프라인 상태입니다. 인터넷 연결을 확인해주세요.'));
        return config;
      }

      // 요청 시작 이벤트 트리거
      pendingRequests++;
      if (loadingEvents.onRequestStart && config.url) {
        loadingEvents.onRequestStart(config.url);
      }

      // 토큰 추가
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

// 응답 인터셉터: 토큰 만료 시 처리 및 로딩 상태 업데이트
apiClient.interceptors.response.use(
  (response) => {
    // 요청 종료 이벤트 트리거
    pendingRequests--;
    if (loadingEvents.onRequestEnd && response.config.url) {
      loadingEvents.onRequestEnd(response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    // 요청이 완료된 경우에만 요청 카운트 감소
    if (error.config) {
      pendingRequests--;
      if (loadingEvents.onRequestEnd && error.config.url) {
        loadingEvents.onRequestEnd(error.config.url);
      }
    }

    // 오프라인 에러
    if (!navigator.onLine) {
      if (loadingEvents.onError) {
        loadingEvents.onError(new Error('오프라인 상태입니다. 인터넷 연결을 확인해주세요.'));
      }
      return Promise.reject(new Error('오프라인 상태입니다. 인터넷 연결을 확인해주세요.'));
    }

    // axios 에러가 아닌 경우
    if (!error.isAxiosError) {
      if (loadingEvents.onError) {
        loadingEvents.onError(error);
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 401 에러(인증 실패)이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 이미 진행 중인 토큰 갱신 요청이 있으면 그 Promise를 재사용
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken();
        }
        
        const newToken = await refreshTokenPromise;
        
        // 토큰 갱신이 완료되면 Promise 초기화
        refreshTokenPromise = null;
        
        // 헤더 업데이트
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 리프레시 실패 처리 (로그아웃)
        refreshTokenPromise = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 로그인 페이지로 리디렉션
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        
        // 글로벌 에러 핸들러 호출
        if (loadingEvents.onError) {
          loadingEvents.onError(refreshError);
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // 글로벌 에러 핸들러 호출
    if (loadingEvents.onError) {
      loadingEvents.onError(error);
    }
    
    return Promise.reject(error);
  }
);

// 액세스 토큰 갱신 함수
const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다');
    }
    
    const response = await axios.post(`${API_URL}/auth/refresh`, null, {
      withCredentials: true,
      headers: {
        'Cookie': `refresh_token=${refreshToken}`
      }
    });
    
    const { accessToken } = response.data;
    
    // 새 토큰 저장
    localStorage.setItem('token', accessToken);
    
    return accessToken;
  } catch (error) {
    // 토큰 갱신 실패 시 스토리지 클리어
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// 로딩 상태 확인 함수
export const isLoading = () => pendingRequests > 0;

// 에러 메시지 표시 함수 (토스트나 알림 표시용)
export const showErrorMessage = (error: unknown) => {
  const message = getUserFriendlyErrorMessage(error);
  
  // 여기에 토스트 또는 알림 표시 로직 추가
  console.error('API 에러:', message);
  
  // 에러 이벤트 발생
  if (loadingEvents.onError) {
    loadingEvents.onError({ message });
  }
  
  return message;
};

export default apiClient;