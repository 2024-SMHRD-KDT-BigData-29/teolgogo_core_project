'use client';
import { useState, useEffect } from 'react';
import styles from './AddToHomeScreen.module.css';

const AddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 동작 방지
      e.preventDefault();
      // 이벤트 저장
      setDeferredPrompt(e);
      // 설치 배너 표시
      setShowPrompt(true);
    };

    // 설치 가능 이벤트 감지
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    // 이미 설치된 경우
    window.addEventListener('appinstalled', () => {
      // 로깅 또는 추적
      console.log('PWA가 설치되었습니다.');
      // 배너 숨기기
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleInstallClick = () => {
    // 배너 숨기기
    setShowPrompt(false);
    
    // 설치 프롬프트가 없으면 종료
    if (!deferredPrompt) return;
    
    // 설치 프롬프트 표시
    deferredPrompt.prompt();
    
    // 사용자 선택 대기
    deferredPrompt.userChoice.then((choiceResult: {outcome: string}) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다.');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다.');
      }
      // 이벤트 사용 후 초기화
      setDeferredPrompt(null);
    });
  };

  if (!showPrompt) return null;

  return (
    <div className={styles.addToHomeScreenContainer}>
      <div className={styles.addToHomeScreenBanner}>
        <div className={styles.bannerContent}>
          <img 
            src="/icons/icon-72x72.png" 
            alt="털고고 앱 아이콘" 
            className={styles.appIcon} 
          />
          <div className={styles.bannerText}>
            <strong>털고고</strong>
            <span>홈 화면에 추가하고 더 쉽게 이용하세요!</span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <button 
            onClick={() => setShowPrompt(false)} 
            className={styles.laterButton}
          >
            나중에
          </button>
          <button 
            onClick={handleInstallClick} 
            className={styles.installButton}
          >
            설치하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreen;