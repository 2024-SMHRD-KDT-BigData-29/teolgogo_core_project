'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 정보 저장 (로깅을 위해)
    this.setState({
      error,
      errorInfo
    });
    
    // 여기서 에러 로깅 서비스에 에러를 보낼 수 있음
    console.error('컴포넌트 에러 발생:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 사용자 정의 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 기본 폴백 UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">무언가 잘못되었습니다</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              죄송합니다. 페이지를 로드하는 중에 오류가 발생했습니다. 새로고침을 하거나 다시 시도해 주세요.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                새로 고침
              </button>
              <Link href="/">
                <button className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                  홈으로 돌아가기
                </button>
              </Link>
            </div>
            
            {/* 개발 환경에서만 상세 에러 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left border-t border-gray-200 dark:border-gray-700 pt-4">
                <details className="text-sm text-red-600 dark:text-red-400">
                  <summary className="cursor-pointer font-medium">에러 상세 정보 (개발 모드)</summary>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto text-xs">
                    <code>{this.state.error?.toString()}</code>
                    {this.state.errorInfo && (
                      <code className="block mt-2 text-gray-700 dark:text-gray-300">
                        {this.state.errorInfo.componentStack}
                      </code>
                    )}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;