// hooks/useDeviceDetection.ts
import { useState, useEffect } from 'react';

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // 화면 크기로 판단
    const checkIfMobile = () => {
      // 1024px 이상은 데스크탑으로 간주
      setIsMobile(window.innerWidth < 1024);
    };
    
    // 초기 확인
    checkIfMobile();
    
    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', checkIfMobile);
    
    // 클린업
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  return { isMobile };
}