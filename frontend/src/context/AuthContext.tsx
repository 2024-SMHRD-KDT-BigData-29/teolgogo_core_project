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


// 푸시 알림 관련 useEffect 추가
useEffect(() => {
  // 로그인 상태가 변경될 때 푸시 알림 구독 확인
  if (!!user) { // isAuthenticated 대신 !!user 사용
    // 푸시 알림 구독 상태 확인 및 구독 요청
    checkAndRequestPushNotification();
  }
}, [user]); // user 의존성 추가

// 푸시 알림 상태 확인 및 요청 함수
const checkAndRequestPushNotification = async () => {
  try {
    // 이미 구독 상태인지 확인 (로컬 스토리지)
    const isPushSubscribed = localStorage.getItem('pushNotificationSubscribed') === 'true';
    
    // 구독되지 않은 경우, 사용자에게 알림 요청
    if (!isPushSubscribed && 'Notification' in window) {
      // 알림 권한이 이미 허용되었거나 거부된 경우는 다시 묻지 않음
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // 잠시 대기 후 알림 요청 (로그인 직후이므로 시간차를 둠)
        setTimeout(() => {
          const notificationPrompt = confirm(
            '견적 알림을 받으시겠습니까? 알림을 통해 견적 제안, 수락 등의 중요 정보를 받을 수 있습니다.'
          );
          
          if (notificationPrompt) {
            requestNotificationPermission();
          }
        }, 2000);
      }
    }
  } catch (error) {
    console.error('푸시 알림 확인 중 오류:', error);
  }
};

// 알림 권한 요청 함수
const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // 권한 허용 시, 서비스 워커 등록 및 푸시 구독 처리
      registerPushSubscription();
    } else {
      console.log('알림 권한이 거부되었습니다.');
    }
  } catch (error) {
    console.error('알림 권한 요청 중 오류:', error);
  }
};

// 푸시 구독 등록 함수
const registerPushSubscription = async () => {
  try {
    // Service Worker가 지원되는지 확인
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      return;
    }
    
    // 서비스 워커 등록
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('서비스 워커 등록 성공:', registration);
    
    // 백엔드에서 공개 키 가져오기
    const response = await fetch('/api/push-notifications/public-key');
    const { publicKey } = await response.json();
    
    // 공개 키를 Uint8Array로 변환
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    
    // 푸시 구독 등록
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    // 백엔드에 구독 정보 전송
    await fetch('/api/push-notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });
    
    // 구독 성공 시 로컬 스토리지에 상태 저장
    localStorage.setItem('pushNotificationSubscribed', 'true');
    console.log('푸시 알림 구독 성공');
  } catch (error) {
    console.error('푸시 구독 등록 중 오류:', error);
  }
};

// Base64 문자열을 Uint8Array로 변환하는 함수
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};



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
      
      // 응답에서 토큰 확인 및 저장
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
      
      // 위치 정보 권한 요청 (타이머를 통해 로그인 완료 후 실행)
      setTimeout(() => {
        requestLocationPermission();
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      console.error('로그인 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      const permissionDialog = confirm(
        '털고고 서비스는 사용자의 위치 정보를 사용하여 주변 업체를 찾고 견적 요청 시 위치 정보를 활용합니다. 위치 정보 제공에 동의하시겠습니까?'
      );
      
      if (permissionDialog) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('위치 정보 권한 승인됨');
            // 위치 정보 동의 상태 저장
            localStorage.setItem('locationPermissionGranted', 'true');
          },
          (error) => {
            console.error('위치 정보 권한 거부됨:', error);
            localStorage.setItem('locationPermissionGranted', 'false');
          }
        );
      } else {
        localStorage.setItem('locationPermissionGranted', 'false');
      }
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