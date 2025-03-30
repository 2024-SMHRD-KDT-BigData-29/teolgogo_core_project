// 헤더 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserProfile } from '@/api/auth';
import { logout } from '@/api/auth';
import { useRouter } from 'next/navigation';



interface User {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'BUSINESS';
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // 사용자 정보 로드
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userInfo = await getUserProfile();
        setUser(userInfo);
      } catch (error) {
        // 비로그인 상태
        console.log('비로그인 상태입니다.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLogin();
  }, []);
  
// 로그아웃 처리 함수 개선
const handleLogout = async () => {
  await logout();
  setUser(null);
  setProfileMenuOpen(false);
  // 로그인 페이지로 리디렉션
  router.push('/login');
};
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      {/* 반응형 컨테이너 적용 */}
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              <Image 
                src="/logo.svg" 
                alt="털고고 로고" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">털고고</span>
          </Link>
          
          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/quotation/new" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              견적 요청하기
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {user.role === 'BUSINESS' ? '펫샵 대시보드' : '내 견적 관리'}
                </Link>
                <Link href="/chat" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  채팅
                </Link>
              </>
            )}
            <Link href="/help" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
              이용 가이드
            </Link>
          </nav>
          
          {/* 데스크톱 로그인/회원가입 또는 프로필 */}
          <div className="hidden md:flex items-center">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">{user.name}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400 dark:text-gray-500" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
                
                {/* 프로필 드롭다운 메뉴 */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      프로필 설정
                    </Link>
                    <button 
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  로그인
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
          
          {/* 모바일 메뉴 버튼 */}
          <button 
            className="flex items-center p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-700 dark:text-gray-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/quotation/new" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                견적 요청하기
              </Link>
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.role === 'BUSINESS' ? '펫샵 대시보드' : '내 견적 관리'}
                  </Link>
                  <Link 
                    href="/chat" 
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    채팅
                  </Link>
                </>
              )}
              <Link 
                href="/help" 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                이용 가이드
              </Link>
              
              {!user && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <Link 
                    href="/login" 
                    className="block w-full text-center py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block w-full text-center mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              )}
              
              {user && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <Link 
                    href="/profile" 
                    className="block w-full text-center py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    프로필 설정
                  </Link>
                  <button 
                    className="block w-full text-center mt-2 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}