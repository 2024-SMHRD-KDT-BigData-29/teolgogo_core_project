'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signup } from '@/api/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createErrorState, resetErrorState, ErrorState } from '@/utils/errorHandling';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// 회원 유형
type UserType = 'CUSTOMER' | 'BUSINESS';

export default function SignupPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 리다이렉션 경로 가져오기
  const redirect = searchParams.get('redirect') || '/';
  
  // 회원 유형 가져오기 (업체 또는 일반 고객)
  const userType = searchParams.get('type') === 'business' ? 'BUSINESS' : 'CUSTOMER';
  
  // 상태 관리
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<UserType>(userType as UserType);
  
  // 업체 회원 추가 정보
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState>(resetErrorState());
  
  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  
  // 인증 상태 확인 및 리다이렉션
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // 이미 로그인 되어 있으면 메인 페이지로 리다이렉션
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);
  
  // 회원 유형 변경 핸들러
  const handleTypeChange = (newType: UserType) => {
    setType(newType);
  };
  
  // 회원가입 폼 제출 핸들러
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // 입력값 검증
  if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    setError({
      hasError: true,
      message: '모든 필수 정보를 입력해주세요.',
      field: !name.trim() ? 'name' : !email.trim() ? 'email' : 'password'
    });
    return;
  }
  
  // 비밀번호 확인
  if (password !== confirmPassword) {
    setError({
      hasError: true,
      message: '비밀번호가 일치하지 않습니다.',
      field: 'confirmPassword'
    });
    return;
  }
  
  // 비밀번호 길이 확인
  if (password.length < 8) {
    setError({
      hasError: true,
      message: '비밀번호는 최소 8자 이상이어야 합니다.',
      field: 'password'
    });
    return;
  }
  
  // 이메일 형식 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError({
      hasError: true,
      message: '유효한 이메일 주소를 입력해주세요.',
      field: 'email'
    });
    return;
  }
  
  // 약관 동의 확인
  if (!agreeTerms || !agreePrivacy) {
    setError({
      hasError: true,
      message: '이용약관 및 개인정보 처리방침에 동의해주세요.',
      field: 'terms'
    });
    return;
  }
  
  // 업체 회원인 경우 업체명 필수
  if (type === 'BUSINESS' && !businessName.trim()) {
    setError({
      hasError: true,
      message: '업체명을 입력해주세요.',
      field: 'businessName'
    });
    return;
  }
  
  try {
    setIsSubmitting(true);
    setError(resetErrorState());
    
    // 회원가입 요청 데이터 준비
    const signupData = {
      name,
      email,
      password,
      phone: phone || undefined,
      role: type,
      // 약관 동의 필드 추가
      agreeTerms,
      agreePrivacy,
      // 업체 회원인 경우 추가 정보
      ...(type === 'BUSINESS' && {
        businessName,
        businessDescription: businessDescription || undefined
      })
    };
    
    // 회원가입 요청
    await signup(signupData);
    
    // 회원가입 성공 시 로그인 페이지로 리다이렉션
    router.push(`/login?signup=success&email=${encodeURIComponent(email)}${redirect !== '/' ? `&redirect=${encodeURIComponent(redirect)}` : ''}`);
  } catch (err) {
    console.error('회원가입 실패:', err);
    setError(createErrorState(err));
  } finally {
    setIsSubmitting(false);
  }
};

  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto max-w-md px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">회원가입</h1>
              <p className="text-gray-600 dark:text-gray-300">
                털고고 서비스를 이용하기 위한 계정을 만들어보세요.
              </p>
            </div>
            
            {/* 에러 메시지 */}
            {error.hasError && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error.message}
              </div>
            )}
            
            {/* 회원 유형 선택 */}
            <div className="mb-6">
              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md border ${
                    type === 'CUSTOMER'
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => handleTypeChange('CUSTOMER')}
                >
                  일반 회원
                </button>
                <button
                  type="button"
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md border ${
                    type === 'BUSINESS'
                      ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => handleTypeChange('BUSINESS')}
                >
                  업체 회원
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {type === 'CUSTOMER'
                  ? '반려동물 미용 서비스를 이용하고 싶은 분들은 일반 회원으로 가입해주세요.'
                  : '미용 서비스를 제공하는 업체는 업체 회원으로 가입해주세요.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                    error.field === 'name' ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="이름"
                  required
                />
              </div>
              
              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                    error.field === 'email' ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="이메일 주소"
                  required
                />
              </div>
              
              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                    error.field === 'password' ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="비밀번호 (8자 이상)"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  8자 이상의 영문, 숫자, 특수문자 조합
                </p>
              </div>
              
              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                    error.field === 'confirmPassword' ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="비밀번호 확인"
                  required
                />
              </div>
              
              {/* 전화번호 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  전화번호
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="'-' 없이 입력 (예: 01012345678)"
                />
              </div>
              
              {/* 업체 회원 추가 정보 */}
              {type === 'BUSINESS' && (
                <>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      업체명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                        error.field === 'businessName' ? 'border-red-500 dark:border-red-500' : ''
                      }`}
                      placeholder="업체명"
                      required={type === 'BUSINESS'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      업체 소개
                    </label>
                    <textarea
                      id="businessDescription"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="업체에 대한 간단한 소개를 작성해주세요."
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {/* 약관 동의 */}
              <div className="space-y-2">
                <div className={`flex items-center ${error.field === 'terms' ? 'text-red-500 dark:text-red-400' : ''}`}>
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm">
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      이용약관
                    </Link>
                    에 동의합니다. <span className="text-red-500">*</span>
                  </label>
                </div>
                
                <div className={`flex items-center ${error.field === 'terms' ? 'text-red-500 dark:text-red-400' : ''}`}>
                  <input
                    id="privacy"
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm">
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      개인정보 처리방침
                    </Link>
                    에 동의합니다. <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>
              
              {/* 회원가입 버튼 */}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition dark:bg-primary-500 dark:hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>가입 중...</span>
                    </div>
                  ) : '회원가입'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이미 계정이 있으신가요?{' '}
                  <Link
                    href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    로그인
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}