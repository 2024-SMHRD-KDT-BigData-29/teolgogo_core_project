'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setLoadingEvents, isLoading } from '@/api/client';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { NotificationProvider } from './NotificationContext';

// 로딩 상태 및 에러 관리를 위한 컨텍스트
interface MainContextType {
  loading: boolean;
  error: string | null;
  clearError: () => void;
  showError: (message: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MainContext = createContext<MainContextType>({
  loading: false,
  error: null,
  clearError: () => {},
  showError: () => {},
  showToast: () => {},
});

// 컨텍스트 훅
export const useMain = () => useContext(MainContext);

// 토스트 인터페이스
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const MainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeRequests, setActiveRequests] = useState<Record<string, boolean>>({});
  
  // 로딩 이벤트 핸들러 설정
  useEffect(() => {
    setLoadingEvents({
      onRequestStart: (url) => {
        setActiveRequests((prev) => ({ ...prev, [url]: true }));
        setLoading(true);
      },
      onRequestEnd: (url) => {
        setActiveRequests((prev) => {
          const updated = { ...prev };
          delete updated[url];
          return updated;
        });
        // 모든 요청이 완료되면 로딩 상태 해제
        setTimeout(() => {
          if (!isLoading()) {
            setLoading(false);
          }
        }, 50); // 약간의 지연을 두어 다른 요청이 시작될 경우 깜빡임 방지
      },
      onError: (error) => {
        let errorMessage = '알 수 없는 오류가 발생했습니다.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String(error.message);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        showError(errorMessage);
      }
    });
  }, []);
  
  // 에러 표시 함수
  const showError = (message: string) => {
    setError(message);
    // 5초 후 에러 메시지 자동 제거
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  // 에러 제거 함수
  const clearError = () => {
    setError(null);
  };
  
  // 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // 3초 후 토스트 메시지 자동 제거
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== newToast.id));
    }, 3000);
  };
  
  // 토스트 제거 함수
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  return (
    <MainContext.Provider value={{ loading, error, clearError, showError, showToast }}>
      <NotificationProvider>
        <ErrorBoundary>
          {children}
          
          {/* 전역 로딩 인디케이터 */}
          {loading && (
            <div className="fixed top-0 left-0 w-full h-1 z-50">
              <div className="h-full bg-primary-600 dark:bg-primary-500 animate-pulse" />
            </div>
          )}
          
          {/* 전역 에러 메시지 */}
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50 px-4">
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md shadow-lg">
                <div className="flex justify-between items-start">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100 ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 토스트 메시지 */}
          <div className="fixed bottom-4 right-4 flex flex-col-reverse space-y-reverse space-y-2 z-50">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`p-4 rounded-md shadow-lg max-w-sm transform transition-all duration-300 ease-in-out ${
                  toast.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    : toast.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span>{toast.message}</span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className={`${
                      toast.type === 'success'
                        ? 'text-green-500 dark:text-green-300 hover:text-green-700 dark:hover:text-green-100'
                        : toast.type === 'error'
                        ? 'text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100'
                        : 'text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100'
                    } ml-2`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ErrorBoundary>
      </NotificationProvider>
    </MainContext.Provider>
  );
};