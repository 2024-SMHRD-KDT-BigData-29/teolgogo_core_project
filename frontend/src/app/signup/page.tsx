// src/app/signup/page.tsx
// 이 페이지는 이름, 이메일, 비밀번호를 입력받아 회원가입을 처리합니다. 
// 비밀번호 확인 기능도 포함되어 있으며, 소셜 로그인 버튼도 제공합니다. 
// 회원가입 성공 시 로그인 페이지로 리디렉션됩니다.

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/api/auth';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function SignupPage() {
  const router = useRouter();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
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

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      // 회원가입 API 호출
      await signup(formData.name, formData.email, formData.password);
      
      // 로그인 페이지로 리디렉션
      router.push('/login?success=true');
    } catch (err: any) {
      setError(
        err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름"
            />
          </div>
          
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
              placeholder="비밀번호 (8자 이상)"
              minLength={8}
            />
          </div>
          
          {/* 비밀번호 확인 입력 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호 확인"
              minLength={8}
            />
          </div>
          
          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>
        
        {/* 소셜 로그인 버튼 */}
        <SocialLoginButtons />
        
        {/* 로그인 링크 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}