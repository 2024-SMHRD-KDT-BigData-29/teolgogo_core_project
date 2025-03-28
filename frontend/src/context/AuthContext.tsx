// src/context/AuthContext.tsx
// React Context API를 사용하여 애플리케이션 전체에서 접근할 수 있는
// 인증 상태를 관리합니다. 
// 사용자 정보를 로드하고, 로그인 상태를 확인하며, 
// 이 정보를 모든 컴포넌트에서 접근할 수 있게 합니다.

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile } from '@/api/auth';

// 사용자 타입 정의
interface User {
  id: number;
  email: string;
  name: string;
  profileImage?: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  setUser: () => {},
  isAuthenticated: false,
});

// 커스텀 훅 생성
export const useAuth = () => useContext(AuthContext);

// 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    // 토큰이 있는 경우에만 사용자 정보 요청
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
        console.error('사용자 정보 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 인증 상태 계산
  const isAuthenticated = !!user;

  // 컨텍스트 값
  const value = {
    user,
    loading,
    error,
    setUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};