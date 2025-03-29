// frontend/src/app/oauth2/additional-info/page.tsx
// 소셜 로그인 후 추가 정보 입력 페이지
// 소셜 계정으로 처음 로그인한 사용자가 필수 정보를 추가로 입력할 수 있는 페이지

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/api/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AdditionalInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    userType: '' as 'CUSTOMER' | 'BUSINESS' | '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 인증 상태 및 사용자 정보 확인
  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    if (!isAuthenticated && !loading) {
      router.push('/login');
      return;
    }
    
    // 이미 추가 정보가 있는 사용자는 대시보드로 리디렉션
    if (user && user.phone && user.nickname) {
      // 리디렉션 URL이 있으면 해당 URL로, 없으면 대시보드로 이동
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [isAuthenticated, user, router, loading, searchParams]);
  
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
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // 필수 필드 확인
    if (!formData.phone || !formData.nickname || !formData.userType) {
      setError('모든 필수 항목을 입력해주세요.');
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
        // 사용자 정보 업데이트 API 호출
        await updateUserProfile({
          nickname: formData.nickname,
          phone: formData.phone,
          role: formData.userType
        });
        
        // 사용자 정보 새로고침
        await refreshUser();
        
        // 성공 메시지 표시
        setSuccess(true);
        
        // 리디렉션 URL이 있으면 해당 URL로, 없으면 대시보드로 이동
        setTimeout(() => {
          const redirectUrl = searchParams.get('redirect') || '/dashboard';
          router.push(redirectUrl);
        }, 2000);
      } catch (err: any) {
        setError(
          err.response?.data?.message || '정보 업데이트에 실패했습니다. 다시 시도해주세요.'
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
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-700">추가 정보 입력</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              서비스 이용을 위해 몇 가지 추가 정보가 필요합니다.
            </p>
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* 성공 메시지 */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">
                정보가 성공적으로 업데이트되었습니다. 자동으로 이동합니다...
              </span>
            </div>
          )}
          
          {/* 추가 정보 입력 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="닉네임"
                  value={formData.nickname}
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="휴대폰 번호 (예: 010-1234-5678)"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {phoneError && (
              <p className="text-sm text-red-600 px-3 py-1 bg-red-50">
                {phoneError}
              </p>
            )}
            
            {/* 회원 유형 선택 */}
            <div className="mt-4">
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
            
            {/* 저장 버튼 */}
            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? '처리 중...' : '정보 저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}