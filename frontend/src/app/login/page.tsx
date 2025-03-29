'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createErrorState, resetErrorState, ErrorState } from '@/utils/errorHandling';
import ErrorBoundary from '@/components/common/ErrorBoundary';

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
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <span className="sr-only">카카오로 로그인</span>
                    <svg
                      className="h-5 w-5"
                      fill="#FEE500" // 카카오 색상
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 3C7.0375 3 3 6.21 3 10.2C3 12.6975 4.60312 14.8875 7.05 16.1025L6.30562 19.6263C6.24937 19.8525 6.4875 20.0419 6.69375 19.9219L10.8469 17.2069C11.2219 17.2506 11.6006 17.2963 12 17.2963C16.9625 17.2963 21 14.0862 21 10.2C21 6.21 16.9625 3 12 3Z" />
                    </svg>
                  </a>
                </div>
                
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <span className="sr-only">구글로 로그인</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c5.522 0 10-4.478 10-10 0-0.617-0.066-1.219-0.179-1.806h-9.821z"
                        fill="#FFF"
                      ></path>
                      <path
                        d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c5.522 0 10-4.478 10-10 0-0.617-0.066-1.219-0.179-1.806h-9.821z"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M4 12c0-0.667 0.082-1.316 0.235-1.938l-3.235-2.493v4.431h3z"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M12 16.868c-1.842 0-3.39-0.62-4.513-1.675l-3.235 2.493c1.527 1.528 3.653 2.477 6 2.477 2.070 0 3.98-0.671 5.531-1.795l-3.042-2.358c-0.723 0.556-1.62 0.887-2.741 0.887z"
                        fill="#EA4335"
                      ></path>
                      <path
                        d="M20 10.239c-0.815-2.428-3.057-4.174-5.748-4.174-1.842 0-3.495 0.642-4.795 1.894l3.237 2.503c0.871-0.591 1.929-0.939 3.057-0.939 2.347 0 4.268 1.621 4.653 3.717h-4.653v3.821h5.536c0.415-1.082 0.713-2.256 0.713-3.475 0-1.143-0.229-2.235-0.538-3.253l-1.462-0.094z"
                        fill="#34A853"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}