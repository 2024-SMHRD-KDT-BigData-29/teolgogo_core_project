// src/app/login/page.tsx
// 이 페이지는 이메일과 비밀번호를 입력받아 일반 로그인을 처리하고, 
// 소셜 로그인 버튼도 제공합니다. 
// 로그인 성공 시 메인 페이지로 리디렉션되고, 
// 실패 시 에러 메시지가 표시됩니다.

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(
    searchParams.get('error') || null
  );
  const [loading, setLoading] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 로그인 API 호출
      const response = await login(formData.email, formData.password);
      
      // 사용자 정보 설정 (선택적)
      // 여기서 API 호출하여 사용자 정보를 가져오고 setUser() 호출 가능
      
      // 메인 페이지로 리디렉션
      router.push('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 입력 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일 주소"
            />
          </div>
          
          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호"
            />
          </div>
          
          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        {/* 소셜 로그인 버튼 */}
        <SocialLoginButtons />
        
        {/* 회원가입 링크 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}