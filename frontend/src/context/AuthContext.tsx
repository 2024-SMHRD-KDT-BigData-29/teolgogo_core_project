// src/context/AuthContext.tsx
// React Context API를 사용하여 애플리케이션 전체에서 접근할 수 있는
// 인증 상태를 관리합니다.
// 사용자 정보를 로드하고, 로그인 상태를 확인하며,
// 이 정보를 모든 컴포넌트에서 접근할 수 있게 합니다.

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, logout as apiLogout, getCurrentUser, UserInfo } from '@/api/auth';

// 사용자 타입 정의
export interface User extends UserInfo {
  id: number;
  email: string;
  name: string;
  nickname?: string; // 닉네임 필드 추가
  profileImage?: string;
  role: string;
  provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER'; // provider 속성 추가
  businessName?: string;
  businessDescription?: string;
  businessLicense?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
  // 추가적인 필드들
  phone?: string;
  averageRating?: number;
  completedServices?: number;
}

// QuoteRequest 인터페이스 추가
export interface QuoteRequest {
  id: number | string;
  title: string;  // 필요한 title 속성만 추가
  // 기타 기본 속성들(필요에 따라 추가 가능)
  [key: string]: any;  // 다른 모든 속성을 허용하는 인덱스 시그니처
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User>;
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  setUser: () => {},
  login: async () => {},
  logout: () => {},
  refreshUser: async () => { throw new Error('Not implemented') }
});

// 커스텀 훅 생성
export const useAuth = () => useContext(AuthContext);

// 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // 토큰이 있는 경우에만 사용자 정보 요청
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // 로컬 스토리지에서 사용자 정보 가져오기 시도
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // 로컬 스토리지에 없으면 API 요청
        const userData = await getCurrentUser();
        setUser(userData as User);
        setError(null);
        
        // 사용자 정보를 로컬 스토리지에 저장
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
        console.error('사용자 정보 로드 오류:', err);
        // 토큰 관련 문제일 수 있으므로 로컬 스토리지 정리
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 사용자 정보 새로고침
  const refreshUser = async (): Promise<User> => {
    try {
      setLoading(true);
      const userInfo = await getCurrentUser();
      const typedUser = userInfo as User;
      setUser(typedUser);
      
      // 업데이트된 사용자 정보를 로컬 스토리지에 저장
      localStorage.setItem('user', JSON.stringify(typedUser));
      
      setError(null);
      return typedUser;
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
      setError('사용자 정보 새로고침에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그인 함수
const login = async (email: string, password: string) => {
  try {
    setLoading(true);
    setError(null);
    
    // API 로그인 호출
    const response = await apiLogin({ email, password });
    
    // 응답에서 토큰 확인 및 저장 (이 부분 추가)
    if (response?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      console.log('액세스 토큰 저장됨:', response.data.accessToken.substring(0, 20) + '...');
    }
    if (response?.data?.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
      console.log('리프레시 토큰 저장됨:', response.data.refreshToken.substring(0, 20) + '...');
    }
    
    // 사용자 정보 가져오기
    const userData = await getCurrentUser();
    const typedUser = userData as User;
    setUser(typedUser);
    
    // 사용자 정보를 로컬 스토리지에 저장
    localStorage.setItem('user', JSON.stringify(typedUser));
  } catch (err: any) {
    setError(err.response?.data?.message || '로그인에 실패했습니다.');
    console.error('로그인 실패:', err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  // 로그아웃 함수
  const logout = () => {
    apiLogout();
    setUser(null);
    setError(null);
    
    // 로컬 스토리지에서 사용자 정보 및 토큰 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  // 인증 상태 계산
  const isAuthenticated = !!user;

  // 컨텍스트 값
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    setUser,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;