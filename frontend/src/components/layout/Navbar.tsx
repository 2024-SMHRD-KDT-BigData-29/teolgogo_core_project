// components/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/api/auth';
import ThemeToggle from '../common/ThemeToggle';

interface NavbarProps {
  scrollToSection?: (sectionId: string) => void;
}

export default function Navbar({ scrollToSection }: NavbarProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
    router.push('/login');
    // 페이지 새로고침 (인증 상태 업데이트를 위해)
    window.location.reload();
  };

  // 메뉴 항목을 클릭하여 특정 섹션으로 스크롤
  const handleSectionClick = (sectionId: string) => {
    setIsMenuOpen(false);
    if (scrollToSection) {
      scrollToSection(sectionId);
    } else {
      // 홈 페이지가 아닌 경우 홈 페이지로 이동 후 해당 섹션으로 스크롤
      router.push(`/?section=${sectionId}`);
    }
  };

  // 견적 요청하기 버튼 클릭
  const handleQuotationRequest = () => {
    if (isAuthenticated) {
      router.push('/quotation/new');
    } else {
      router.push('/login?redirect=/quotation/new');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* 로고 및 홈 링크 */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                텔고고
              </Link>
            </div>
            
            {/* 네비게이션 링크 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
              >
                홈
              </Link>
              <button
                onClick={() => handleSectionClick('map')}
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
              >
                내 주변 미용업체 찾아보기
              </button>
              <Link
                href="/recommendation"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
              >
                펫 미용 스타일 AI 추천 받아보세요!
              </Link>
              <button
                onClick={() => handleSectionClick('reviews')}
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
              >
                리뷰 보기
              </button>
            </div>
          </div>
          
          {/* 사용자 메뉴와 테마 전환 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* 테마 토글 버튼 */}
            <ThemeToggle className="mr-2" />
            
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                      {user?.name || '사용자'}
                    </span>
                  </button>
                </div>
                
                {/* 드롭다운 메뉴 */}
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      프로필
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {user?.role === 'BUSINESS' ? '업체 대시보드' : '내 견적 관리'}
                    </Link>
                    {user?.role === 'CUSTOMER' && (
                      <Link
                        href="/pet-profiles"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        반려동물 프로필
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
          
          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center sm:hidden">
            {/* 모바일에서도 테마 토글 표시 */}
            <ThemeToggle className="mr-2" />
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">메뉴 열기</span>
              {/* 햄버거 아이콘 */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              홈
            </Link>
            <button
              onClick={() => handleSectionClick('map')}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              내 주변 미용업체 찾아보기
            </button>
            <Link
              href="/recommendation"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              펫 미용 스타일 AI 추천
            </Link>
            <button
              onClick={() => handleSectionClick('reviews')}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              리뷰 보기
            </button>
          </div>
          
          {/* 모바일 로그인 메뉴 */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name || '사용자'}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  프로필
                </Link>
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user?.role === 'BUSINESS' ? '업체 대시보드' : '내 견적 관리'}
                </Link>
                {user?.role === 'CUSTOMER' && (
                  <Link
                    href="/pet-profiles"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    반려동물 프로필
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  href="/login"
                  className="block py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="block py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}