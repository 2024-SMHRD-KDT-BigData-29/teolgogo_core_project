// src/components/auth/SocialLoginButtons.tsx
// 이 컴포넌트는 Google, Kakao, Naver 소셜 로그인 버튼을 제공합니다. 
// 각 버튼을 클릭하면 백엔드에서 구현한 OAuth2 인증 엔드포인트로 
// 리디렉션됩니다. 버튼은 Tailwind CSS로 스타일링되어 있습니다.

'use client';

import React from 'react';
import { getSocialLoginUrl } from '@/api/auth';
import Image from 'next/image';

// 컴포넌트 Props 정의
interface SocialLoginButtonsProps {
  redirectUri?: string;
  className?: string;
  modern?: boolean; // 새로운 디자인 사용 여부
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  redirectUri,
  className = "",
  modern = false
}) => {
  // 소셜 로그인 처리 함수
  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    // redirectUri가 있으면 객체 형태로 전달, 아니면 provider만 전달
    const url = redirectUri 
      ? getSocialLoginUrl({ provider, redirectUri }) 
      : getSocialLoginUrl(provider);
      
    window.location.href = url;
  };

  // 모던 디자인 버튼을 사용하는 경우
  if (modern) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {/* Kakao 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('kakao')}
          className="w-full flex items-center justify-center gap-2 bg-yellow-300 text-gray-800 py-2 px-4 rounded-md font-semibold hover:bg-yellow-400 transition duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.48 2 11c0 2.79 1.35 5.17 3.5 6.73V21l3.25-2.53c1.05.39 2.19.53 3.25.53 5.52 0 10-3.48 10-8s-4.48-8-10-8z" />
          </svg>
          카카오로 시작하기
        </button>
        
        {/* Naver 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('naver')}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition duration-200"
        >
          <span className="font-bold text-xs">N</span>
          네이버로 시작하기
        </button>
        
        {/* Google 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('google')}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-50 transition duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 시작하기
        </button>
      </div>
    );
  }

  // 기본 디자인 버튼 (옛 버전)
  return (
    <div className={`flex flex-col space-y-4 w-full max-w-xs mx-auto mt-6 ${className}`}>
      {/* Google 로그인 버튼 */}
      <button
        onClick={() => handleSocialLogin('google')}
        className="flex items-center justify-center px-4 py-2 space-x-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm font-medium text-gray-700">Google로 계속하기</span>
      </button>

      {/* Kakao 로그인 버튼 */}
      <button
        onClick={() => handleSocialLogin('kakao')}
        className="flex items-center justify-center px-4 py-2 space-x-2 bg-yellow-300 border border-yellow-400 rounded-md shadow-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <span className="text-sm font-medium text-yellow-900">카카오로 계속하기</span>
      </button>

      {/* Naver 로그인 버튼 */}
      <button
        onClick={() => handleSocialLogin('naver')}
        className="flex items-center justify-center px-4 py-2 space-x-2 bg-green-500 border border-green-600 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span className="text-sm font-medium text-white">네이버로 계속하기</span>
      </button>

      <div className="my-4 flex items-center justify-center">
        <div className="border-t border-gray-300 flex-grow"></div>
        <span className="px-4 text-gray-500 text-sm">또는</span>
        <div className="border-t border-gray-300 flex-grow"></div>
      </div>
    </div>
  );
};

export default SocialLoginButtons;