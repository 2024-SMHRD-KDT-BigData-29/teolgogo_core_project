// src/app/oauth2/redirect/page.tsx
// 이 컴포넌트는 소셜 로그인 성공 후 백엔드에서 리디렉션되었을 때
// URL의 쿼리 파라미터에서 토큰을 추출하고 저장합니다. 
// 토큰이 성공적으로 저장되면 메인 페이지로 리디렉션하고, 
// 오류가 있으면 로그인 페이지로 리디렉션합니다.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OAuth2RedirectHandler() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [message, setMessage] = useState('소셜 로그인 처리 중...');

  useEffect(() => {
    // URL 쿼리 파라미터 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (token) {
      // 토큰 저장
      localStorage.setItem('token', token);
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // 사용자 정보 요청 (선택적)
      // 여기서 API 호출하여 사용자 정보를 가져오고 setUser() 호출 가능
      
      setMessage('로그인이 완료되었습니다. 메인 페이지로 이동합니다...');
      
      // 메인 페이지로 리디렉션
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      // 에러 처리
      setMessage(`로그인에 실패했습니다: ${error || '알 수 없는 오류'}`);
      
      // 로그인 페이지로 리디렉션
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [router, setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm text-center">
        <h2 className="text-2xl font-semibold mb-4">소셜 로그인</h2>
        <p className="text-lg">{message}</p>
        {/* 로딩 스피너 추가 가능 */}
      </div>
    </div>
  );
}