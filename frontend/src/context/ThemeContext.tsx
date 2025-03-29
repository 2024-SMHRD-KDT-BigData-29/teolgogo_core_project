'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 테마 타입 정의
type Theme = 'light' | 'dark';

// 테마 컨텍스트 타입 정의
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// 기본값으로 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
});

// 커스텀 훅 생성
export const useTheme = () => useContext(ThemeContext);

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 테마 상태 관리
  const [theme, setTheme] = useState<Theme>('light');
  // 마운트 여부 추적 (hydration 이슈 방지)
  const [mounted, setMounted] = useState(false);

  // 브라우저의 선호 테마 감지 함수
  const detectPreferredTheme = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 테마 불러오기
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setMounted(true);
    
    // 로컬 스토리지에서 테마 가져오기
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // 저장된 테마가 있으면 사용, 없으면 브라우저 선호 테마 사용
    const initialTheme = savedTheme || detectPreferredTheme();
    setTheme(initialTheme);
    
    // HTML 요소에 테마 클래스 적용
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 테마 전환 함수
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // 로컬 스토리지에 테마 저장
    localStorage.setItem('theme', newTheme);
    
    // HTML 요소에 테마 클래스 적용
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // hydration 이슈 방지를 위해 마운트 전에는 null 반환
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;