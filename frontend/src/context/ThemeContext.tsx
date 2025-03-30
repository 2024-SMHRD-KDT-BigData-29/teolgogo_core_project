'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 테마 타입 정의
type Theme = 'light' | 'dark';

// 테마 컨텍스트 타입 정의
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// 기본값으로 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

// 커스텀 훅 생성
export const useTheme = () => useContext(ThemeContext);

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 테마 상태 관리 (초기값은 'light'로 설정하여 hydration 불일치 방지)
  const [theme, setThemeState] = useState<Theme>('light');
  // 마운트 여부 추적
  const [mounted, setMounted] = useState(false);

  // 브라우저의 선호 테마 감지 함수
  const detectPreferredTheme = (): Theme => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch (e) {
      return 'light';
    }
  };

  // 테마 적용 함수
  const applyTheme = (newTheme: Theme) => {
    // HTML 요소에 테마 클래스 적용
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    }
    setThemeState(newTheme);
  };

  // 테마 설정 함수 - 외부에서 호출 가능
  const setTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;
    
    // 로컬 스토리지에 테마 저장
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
    } catch (e) {
      console.error('로컬 스토리지에 테마를 저장하는 데 실패했습니다:', e);
    }
    
    applyTheme(newTheme);
  };

  // 테마 전환 함수
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 컴포넌트 마운트 시 테마 설정
  useEffect(() => {
    setMounted(true);
    
    try {
      // 로컬 스토리지에서 테마 가져오기
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // 저장된 테마가 있으면 사용, 없으면 브라우저 선호 테마 사용
      const initialTheme = savedTheme || detectPreferredTheme();
      applyTheme(initialTheme);

      // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // 미디어 쿼리 변경 이벤트 리스너
      const handleChange = (e: MediaQueryListEvent) => {
        // 로컬 스토리지에 테마가 저장되어 있지 않은 경우에만 시스템 테마를 따름
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          applyTheme(newTheme);
        }
      };
      
      // 변경 이벤트 리스너 등록
      mediaQuery.addEventListener('change', handleChange);
      
      // 정리 함수
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } catch (e) {
      console.error('테마 설정 중 오류 발생:', e);
      // 오류 발생 시 기본 라이트 테마 적용
      applyTheme('light');
    }
  }, []);

  // 컨텍스트 제공
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;