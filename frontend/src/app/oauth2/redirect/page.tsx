// frontend/src/app/oauth2/redirect/page.tsx
// 소셜 로그인 후 리디렉션 처리 페이지
// OAuth 서버에서 리다이렉트된 후 처리하는 페이지입니다.

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OAuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const redirectUri = searchParams.get('redirect_uri') || '/';
    
    const handleOAuthCallback = async () => {
      try {
        if (error) {
          throw new Error(error);
        }
        
        if (!token) {
          throw new Error('인증 토큰이 없습니다');
        }
        
        // 토큰 저장
        localStorage.setItem('token', token);
        
        // 사용자 정보 새로고침
        const userData = await refreshUser();
        
        // 사용자 정보가 불완전한 경우 (소셜 로그인 최초 사용자)
        // 닉네임이나 휴대폰 번호가 없는 경우 추가 정보 입력 페이지로 리디렉트
        if (!userData.nickname || !userData.phone) {
          router.push(`/oauth2/additional-info?redirect=${encodeURIComponent(redirectUri)}`);
          return;
        }
        
        // 완전한 사용자 정보가 있으면 원래 리디렉션 URL로 이동
        router.push(redirectUri);
      } catch (err: any) {
        console.error('소셜 로그인 처리 오류:', err);
        setError(err.message || '로그인에 실패했습니다');
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };
    
    handleOAuthCallback();
  }, [router, searchParams, refreshUser]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-4">소셜 로그인 실패</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-blue-600 mb-4">로그인 처리 중</h1>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600">소셜 로그인 정보를 처리하고 있습니다. 잠시만 기다려주세요...</p>
          </>
        )}
      </div>
    </div>
  );
}