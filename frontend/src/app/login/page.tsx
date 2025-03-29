// src/app/login/page.tsx
// 이 페이지는 이메일과 비밀번호를 입력받아 일반 로그인을 처리하고, 
// 소셜 로그인 버튼도 제공합니다. 
// 로그인 성공 시 리디렉션되고, 실패 시 에러 메시지가 표시됩니다.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function LoginPage() {
  // 라우터 및 검색 파라미터 (URL 쿼리) 가져오기
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 인증 컨텍스트에서 로그인 함수 가져오기
  const { login, isAuthenticated } = useAuth();
  
  // 폼 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') || null
  );
  const [loading, setLoading] = useState(false);
  
  // 리디렉션 경로 설정
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  // 소셜 로그인 리디렉션 URI
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/oauth2/redirect` 
    : '';
  
  // 이미 로그인되어 있으면 대시보드로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 로그인 함수 호출 (AuthContext에서 제공)
      await login(email, password);
      
      // 로그인 상태 유지 설정 (필요한 경우 구현)
      if (rememberMe) {
        // 로컬 스토리지에 상태 저장 또는 다른 방식으로 구현
        localStorage.setItem('rememberMe', 'true');
      }
      
      // 리디렉션 경로로 이동
      router.push(redirectPath);
    } catch (err: any) {
      setError(
        err.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">털고고</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-700">로그인</h2>
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* 로그인 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                이메일 주소
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 로그인 상태 유지 및 비밀번호 찾기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        {/* 소셜 로그인 영역 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">소셜 로그인</span>
            </div>
          </div>

          <div className="mt-6">
            <SocialLoginButtons redirectUri={redirectUri} modern={true} />
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}