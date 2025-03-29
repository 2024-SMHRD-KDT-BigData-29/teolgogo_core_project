// frontend/src/utils/errorHandling.ts
// API 에러 핸들링을 위한 유틸리티 함수

import { AxiosError } from 'axios';

// API 에러 유형
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: string;
  status?: number;
}

// API 에러 응답 변환 함수
export const handleApiError = (error: unknown): ApiError => {
  // Axios 에러인 경우
  if (isAxiosError(error)) {
    const { response } = error;
    
    // 응답이 있는 경우 (서버 에러)
    if (response) {
      const { status, data } = response;
      
      // 백엔드에서 정형화된 에러 응답을 보낸 경우
      if (data && typeof data === 'object') {
        // 백엔드에서 error 속성으로 에러 메시지를 담아 보내는 경우
        if ('error' in data && typeof data.error === 'string') {
          return {
            message: data.error,
            status
          };
        }
        
        // 백엔드에서 message 속성으로 에러 메시지를 담아 보내는 경우
        if ('message' in data && typeof data.message === 'string') {
          return {
            message: data.message,
            code: data.code as string | undefined,
            field: data.field as string | undefined,
            details: data.details as string | undefined,
            status
          };
        }
      }
      
      // 상태 코드별 기본 에러 메시지
      return {
        message: getErrorMessageByStatus(status),
        status
      };
    }
    
    // 네트워크 에러인 경우
    if (error.request) {
      return {
        message: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
        code: 'NETWORK_ERROR'
      };
    }
  }
  
  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack
    };
  }
  
  // 그 외 에러의 경우
  return {
    message: '알 수 없는 오류가 발생했습니다.'
  };
};

// 상태 코드별 에러 메시지
export const getErrorMessageByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return '잘못된 요청입니다. 입력 데이터를 확인해주세요.';
    case 401:
      return '로그인이 필요하거나 인증 정보가 만료되었습니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return '리소스 충돌이 발생했습니다. 중복된 데이터가 존재할 수 있습니다.';
    case 422:
      return '입력된 데이터의 형식이 올바르지 않습니다.';
    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 502:
    case 503:
    case 504:
      return '서비스 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

// Axios 에러 타입 가드
function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && typeof error === 'object' && 'isAxiosError' in error;
}

// 사용자에게 표시할 에러 메시지 생성
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  
  // 필드 에러인 경우 상세 메시지 표시
  if (apiError.field) {
    return `${apiError.field}: ${apiError.message}`;
  }
  
  return apiError.message;
};

// API 호출 시 에러 처리 훅에서 사용하는 에러 타입
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  field?: string;
  status?: number;
}

// 에러 상태 초기값
export const initialErrorState: ErrorState = {
  hasError: false,
  message: ''
};

// ErrorState 생성 함수
export const createErrorState = (error: unknown): ErrorState => {
  const apiError = handleApiError(error);
  
  return {
    hasError: true,
    message: apiError.message,
    code: apiError.code,
    field: apiError.field,
    status: apiError.status
  };
};

// 에러 리셋 함수
export const resetErrorState = (): ErrorState => initialErrorState;