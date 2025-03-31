// hooks/usePushNotification.ts
import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { useMain } from '@/context/MainProvider';
import { isPushNotificationSupported, getBrowserInfo } from '@/utils/notificationUtils';

export function usePushNotification() {
  const { showToast } = useMain();
  const {
    isSubscribed,
    isPushSupported,
    permissionState,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    requestNotificationPermission
  } = useNotification();
  
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const browserInfo = getBrowserInfo();
  
  // 사용자에게 알림 구독을 유도하는 프롬프트를 표시할지 여부를 결정
  useEffect(() => {
    // 이미 알림을 구독했거나 권한을 거부한 경우 또는 지원하지 않는 경우 표시하지 않음
    if (isSubscribed || permissionState === 'denied' || !isPushSupported) {
      setIsPromptVisible(false);
      return;
    }
    
    // 로컬 스토리지에서 프롬프트 표시 여부 확인
    const hasPromptedBefore = localStorage.getItem('notification_prompted');
    const lastPromptDate = localStorage.getItem('notification_prompted_date');
    
    if (!hasPromptedBefore) {
      // 처음 방문한 경우 잠시 대기 후 프롬프트 표시
      const timer = setTimeout(() => {
        setIsPromptVisible(true);
        localStorage.setItem('notification_prompted', 'true');
        localStorage.setItem('notification_prompted_date', new Date().toISOString());
      }, 5000); // 5초 후 표시
      
      return () => clearTimeout(timer);
    } else if (lastPromptDate) {
      // 마지막 표시 날짜가 7일 이전인 경우 다시 표시
      const lastDate = new Date(lastPromptDate);
      const currentDate = new Date();
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 7) {
        setIsPromptVisible(true);
        localStorage.setItem('notification_prompted_date', currentDate.toISOString());
      }
    }
  }, [isSubscribed, permissionState, isPushSupported]);
  
  // 알림 구독 처리
  const handleSubscribe = async () => {
    setIsPromptVisible(false);
    
    if (!isPushSupported) {
      showToast('이 브라우저는 푸시 알림을 지원하지 않습니다.', 'error');
      return false;
    }
    
    try {
      const success = await subscribeToPushNotifications();
      if (success) {
        showToast('견적 관련 중요 알림을 받을 수 있습니다!', 'success');
        return true;
      }
    } catch (error) {
      console.error('알림 구독 중 오류:', error);
    }
    
    return false;
  };
  
  // 알림 구독 취소 처리
  const handleUnsubscribe = async () => {
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        showToast('알림 수신이 중지되었습니다.', 'info');
        return true;
      }
    } catch (error) {
      console.error('알림 구독 취소 중 오류:', error);
    }
    
    return false;
  };
  
  // 알림 프롬프트 닫기
  const dismissPrompt = () => {
    setIsPromptVisible(false);
    // 이번 세션에서 다시 표시하지 않음
    sessionStorage.setItem('notification_prompt_dismissed', 'true');
  };
  
  // iOS Safari에서는 푸시 알림이 지원되지 않으므로 별도 처리
  const isIOSSafari = browserInfo.isIOS && browserInfo.name === 'Safari';
  
  return {
    isSubscribed,
    isPushSupported: isPushSupported && !isIOSSafari,
    permissionState,
    isPromptVisible: isPromptVisible && !sessionStorage.getItem('notification_prompt_dismissed'),
    browserInfo,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,
    requestPermission: requestNotificationPermission,
    dismissPrompt
  };
}