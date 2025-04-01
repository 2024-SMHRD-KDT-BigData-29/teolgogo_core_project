'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createErrorState, resetErrorState, ErrorState } from '@/utils/errorHandling';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'; // 소셜 로그인 버튼 컴포넌트 import

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 리다이렉션 경로 가져오기
  const redirect = searchParams.get('redirect') || '/';
  
  // 서비스 파라미터 (견적 요청 시 서비스 유형)
  const service = searchParams.get('service');
  
  // 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState>(resetErrorState());
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  
  // 인증 상태 확인 및 리다이렉션
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // 로그인 되어 있으면 리다이렉션
      let targetUrl = redirect;
      
      // 서비스 파라미터가 있으면 추가
      if (service && targetUrl.includes('/quotation/new')) {
        targetUrl = `${targetUrl}?service=${service}`;
      }
      
      router.push(targetUrl);
    } else if (!loading && redirect && redirect !== '/') {
      // 리다이렉션 경로가 있으면 메시지 표시
      const pathName = redirect.split('?')[0]; // 쿼리 파라미터 제외
      
      if (pathName === '/quotation/new') {
        setRedirectMessage('견적 요청을 위해 로그인이 필요합니다.');
      } else if (pathName.startsWith('/pet-profiles')) {
        setRedirectMessage('반려동물 프로필 관리를 위해 로그인이 필요합니다.');
      } else {
        setRedirectMessage('해당 기능을 이용하기 위해 로그인이 필요합니다.');
      }
    }
  }, [isAuthenticated, loading, redirect, router, service]);

  useEffect(() => {
    const signupSuccess = searchParams.get('signup') === 'success';
    const email = searchParams.get('email') || '';
    if (signupSuccess) {
      setShowSignupSuccess(true);
      setSignupEmail(email);
      
      // 자동으로 이메일 필드 채우기
      setEmail(email);
  
      // 5초 후 성공 메시지 숨기기
      const timer = setTimeout(() => {
        setShowSignupSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, setEmail]);
  


  
  // 로그인 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!email.trim() || !password.trim()) {
      setError({
        hasError: true,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
        field: !email.trim() ? 'email' : 'password'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(resetErrorState());
      
      // 로그인 요청
      await login(email, password);
      
      // 로그인 성공 시 리다이렉션
      let targetUrl = redirect;
      
      // 서비스 파라미터가 있으면 추가
      if (service && targetUrl.includes('/quotation/new')) {
        targetUrl = `${targetUrl}?service=${service}`;
      }
      
      router.push(targetUrl);
    } catch (err) {
      console.error('로그인 실패:', err);
      setError(createErrorState(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="container mx-auto max-w-md px-4 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">


            {/* 회원가입 성공 메시지 */}
          {showSignupSuccess && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">축하합니다! 회원가입이 완료되었습니다.</p>
                {signupEmail && (
                  <p className="text-sm mt-1">{signupEmail} 계정으로 로그인해주세요.</p>
                )}
              </div>
            </div>
          )}


            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">로그인</h1>
              <p className="text-gray-600 dark:text-gray-300">
                반려동물과 함께하는 특별한 경험을 시작하세요.
              </p>
              
              {/* 리다이렉션 메시지 */}
              {redirectMessage && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-md">
                  {redirectMessage}
                </div>
              )}
            </div>
            
            {/* 에러 메시지 */}
            {error.hasError && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${error.field === 'email' ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="이메일 주소"
                  autoComplete="email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${error.field === 'password' ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    로그인 유지
                  </label>
                </div>
                
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition dark:bg-primary-500 dark:hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>로그인 중...</span>
                    </div>
                  ) : '로그인'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  계정이 없으신가요?{' '}
                  <Link
                    href={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    회원가입
                  </Link>
                </p>
              </div>
            </form>
            
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">또는</span>
                </div>
              </div>
              
              {/* 소셜 로그인 버튼 */}
              <div className="mt-6">
                <SocialLoginButtons 
                  redirectUri={redirect !== '/' ? redirect : undefined} 
                  modern={true} 
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}