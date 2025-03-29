// src/app/signup/page.tsx
// 이 페이지는 고객/업체 회원가입을 처리합니다.
// 유형에 따라 다른 입력 필드를 표시합니다.

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/api/auth';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '' as 'CUSTOMER' | 'BUSINESS' | '',
    // 업체 회원 추가 필드
    businessName: '',
    businessLicense: '',
    businessDescription: '',
    address: '',
    specialties: [] as string[],
  });
  
  const [error, setError] = useState<string | null>(
    searchParams.get('error') || null
  );
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // 소셜 로그인 리디렉션 URI
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/oauth2/redirect` 
    : '';

  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 전화번호 유효성 검사
    if (name === 'phone') {
      const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
      if (!phoneRegex.test(value)) {
        setPhoneError('유효한 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)');
      } else {
        setPhoneError(null);
      }
    }
  };
  
  // 사용자 유형 선택 핸들러
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      userType: e.target.value as 'CUSTOMER' | 'BUSINESS'
    }));
  };
  
  // 전문 분야 선택 핸들러
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const checked = e.target.checked;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, specialties: [...prev.specialties, value] };
      } else {
        return { ...prev, specialties: prev.specialties.filter(item => item !== value) };
      }
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 필수 필드 확인 (기본 필드)
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.nickname || !formData.userType) {
      setError('모든 필수 항목을 입력해주세요.');
      setLoading(false);
      return;
    }
    
    // 업체 회원 필수 필드 확인
    if (formData.userType === 'BUSINESS') {
      if (!formData.businessName || !formData.businessLicense) {
        setError('업체 회원은 상호명과 사업자 번호를 입력해야 합니다.');
        setLoading(false);
        return;
      }
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    
    // 전화번호 형식 확인
    if (phoneError) {
      setError(phoneError);
      setLoading(false);
      return;
    }

    try {
      // 필요없는 필드 제외하고 회원가입 API 호출
      const { confirmPassword, ...signupData } = formData;
      const signupPayload = {
        ...signupData,
        role: signupData.userType // role 필드로 변환
      };
      
      await signup(signupPayload);
      
      // 로그인 페이지로 리디렉션 (성공 메시지 포함)
      router.push('/login?signup=success');
    } catch (err: any) {
      setError(
        err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-gray-900">털고고</h1>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-700">회원가입</h2>
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* 회원가입 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* 회원 유형 선택 (라디오 버튼) */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                회원 유형 <span className="text-red-500">*</span>
              </p>
              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="CUSTOMER"
                    checked={formData.userType === 'CUSTOMER'}
                    onChange={handleUserTypeChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-2 text-gray-700">고객 회원</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="BUSINESS"
                    checked={formData.userType === 'BUSINESS'}
                    onChange={handleUserTypeChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">업체 회원</span>
                </label>
              </div>
            </div>
            
            <div className="rounded-md shadow-sm -space-y-px">
              {/* 이름 입력 */}
              <div>
                <label htmlFor="name" className="sr-only">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              {/* 닉네임 입력 */}
              <div>
                <label htmlFor="nickname" className="sr-only">
                  닉네임
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="닉네임"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
              
              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="sr-only">
                  이메일 주소 (로그인 아이디로 사용)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="이메일 주소 (로그인 아이디로 사용)"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              {/* 휴대폰 번호 입력 */}
              <div>
                <label htmlFor="phone" className="sr-only">
                  휴대폰 번호
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="휴대폰 번호 (예: 010-1234-5678)"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              {phoneError && (
                <p className="text-sm text-red-600 px-3 py-1 bg-red-50">
                  {phoneError}
                </p>
              )}
              
              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="비밀번호 (8자 이상)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              {/* 비밀번호 확인 입력 */}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${formData.userType !== 'BUSINESS' ? 'rounded-b-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="비밀번호 확인"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              {/* 업체 회원 전용 필드 */}
              {formData.userType === 'BUSINESS' && (
                <>
                  {/* 업체명 입력 */}
                  <div>
                    <label htmlFor="businessName" className="sr-only">
                      업체명
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="업체명 (상호)"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* 사업자 번호 입력 */}
                  <div>
                    <label htmlFor="businessLicense" className="sr-only">
                      사업자 번호
                    </label>
                    <input
                      id="businessLicense"
                      name="businessLicense"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="사업자 등록 번호 (예: 123-45-67890)"
                      value={formData.businessLicense}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* 업체 주소 입력 */}
                  <div>
                    <label htmlFor="address" className="sr-only">
                      업체 주소
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="업체 주소"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* 업체 소개 입력 */}
                  <div>
                    <label htmlFor="businessDescription" className="sr-only">
                      업체 소개
                    </label>
                    <textarea
                      id="businessDescription"
                      name="businessDescription"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="업체 소개 (선택사항)"
                      rows={3}
                      value={formData.businessDescription}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* 업체 전문 분야 선택 (체크박스) */}
            {formData.userType === 'BUSINESS' && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  전문 분야 (해당하는 항목 모두 선택)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specialty"
                      value="소형견"
                      checked={formData.specialties.includes('소형견')}
                      onChange={handleSpecialtyChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">소형견 전문</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specialty"
                      value="중대형견"
                      checked={formData.specialties.includes('중대형견')}
                      onChange={handleSpecialtyChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">중대형견 전문</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specialty"
                      value="고양이"
                      checked={formData.specialties.includes('고양이')}
                      onChange={handleSpecialtyChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">고양이 전문</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="specialty"
                      value="스페셜케어"
                      checked={formData.specialties.includes('스페셜케어')}
                      onChange={handleSpecialtyChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">스페셜 케어</span>
                  </label>
                </div>
              </div>
            )}

            {/* 회원가입 버튼 */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? '가입 중...' : '회원가입'}
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
                <span className="px-2 bg-gray-50 text-gray-500">소셜 계정으로 시작하기</span>
              </div>
            </div>

            <div className="mt-6">
              <SocialLoginButtons redirectUri={redirectUri} modern={true} />
            </div>
          </div>

          {/* 로그인 링크 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}