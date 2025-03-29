'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-red-600 dark:text-red-400 mb-6">
              <svg 
                className="w-16 h-16 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              이런! 문제가 발생했습니다
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              죄송합니다. 예상치 못한 오류가 발생했습니다. 다시 시도해 보시거나 홈페이지로 돌아가세요.
            </p>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => reset()}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                다시 시도하기
              </button>
              
              <a 
                href="/"
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                홈페이지로 돌아가기
              </a>
            </div>
            
            {/* 개발 환경에서만 상세 에러 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left">
                <details className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                  <summary className="font-medium text-red-600 dark:text-red-400 cursor-pointer mb-2">
                    디버그 정보 (개발 모드)
                  </summary>
                  <div className="mt-2 text-xs font-mono overflow-auto max-h-60 bg-gray-200 dark:bg-gray-800 p-2 rounded">
                    <p className="text-red-600 dark:text-red-400">{error.message}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{error.stack}</p>
                    {error.digest && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Digest: {error.digest}</p>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}