// src/components/auth/SocialLoginButtons.tsx
// 이 컴포넌트는 Google, Kakao, Naver 소셜 로그인 버튼을 제공합니다. 
// 각 버튼을 클릭하면 백엔드에서 구현한 OAuth2 인증 엔드포인트로 
// 리디렉션됩니다. 버튼은 Tailwind CSS로 스타일링되어 있습니다.

'use client';

import React from 'react';
import { getSocialLoginUrl } from '@/api/auth';
import Image from 'next/image';

const SocialLoginButtons: React.FC = () => {
  // 소셜 로그인 처리 함수
  const handleSocialLogin = (provider: 'google' | 'kakao' | 'naver') => {
    // 소셜 로그인 URL로 리디렉션
    const url = getSocialLoginUrl(provider);
    window.location.href = url;
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto mt-6">
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