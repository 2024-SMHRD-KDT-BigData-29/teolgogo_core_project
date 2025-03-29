// src/app/oauth2/redirect/page.tsx
// 이 컴포넌트는 소셜 로그인 성공 후 백엔드에서 리디렉션되었을 때
// URL의 쿼리 파라미터에서 토큰을 추출하고 저장합니다. 
// 토큰이 성공적으로 저장되면 대시보드로 리디렉션하고, 
// 오류가 있으면 로그인 페이지로 리디렉션합니다.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OAuth2RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('소셜 로그인 처리 중...');

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        // URL 파라미터에서 토큰 추출
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');
        const redirectPath = searchParams.get('redirect') || '/dashboard';

        // 오류 처리
        if (errorParam) {
          const decodedError = decodeURIComponent(errorParam);
          setError(decodedError);
          setMessage(`로그인에 실패했습니다: ${decodedError}`);
          return;
        }

        // 토큰이 없는 경우 오류 처리
        if (!token) {
          setError('인증 토큰을 찾을 수 없습니다.');
          setMessage('인증 토큰을 찾을 수 없습니다.');
          return;
        }

        // 토큰 저장
        localStorage.setItem('token', token);
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // 사용자 정보 불러오기
        await refreshUser();
        
        // 성공 메시지 표시
        setMessage('로그인이 완료되었습니다. 대시보드로 이동합니다...');
        
        // 리디렉션 경로로 이동
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } catch (err) {
        console.error('OAuth 리다이렉트 처리 오류:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
        setMessage('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthRedirect();
  }, [router, searchParams, refreshUser]);

  // 오류 발생 시 화면
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">오류 발생</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">소셜 로그인</h2>
        <p className="text-lg mb-6">{message}</p>
        {/* 로딩 스피너 */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}