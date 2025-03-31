'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMain } from './MainProvider';
import { urlBase64ToUint8Array } from '../utils/notificationUtils';

// 알림 컨텍스트 타입 정의
interface NotificationContextType {
  isSubscribed: boolean;
  isPushSupported: boolean;
  permissionState: NotificationPermission | null;
  subscribeToPushNotifications: () => Promise<boolean>;
  unsubscribeFromPushNotifications: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  isSubscribed: false,
  isPushSupported: false,
  permissionState: null,
  subscribeToPushNotifications: async () => false,
  unsubscribeFromPushNotifications: async () => false,
  requestNotificationPermission: async () => false,
});

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { showToast, showError } = useMain();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 서비스 워커와 알림 지원 여부 확인
  useEffect(() => {
    // 브라우저 지원 체크
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsPushSupported(isSupported);

      if (!isSupported) {
        console.log('이 브라우저는 푸시 알림을 지원하지 않습니다.');
        return;
      }

      // 현재 퍼미션 상태 체크
      setPermissionState(Notification.permission);

      try {
        // 서비스 워커 등록 가져오기
        const registration = await navigator.serviceWorker.ready;
        setSwRegistration(registration);

        // 공개 키 가져오기
        const response = await fetch('/api/push-notifications/public-key');
        const data = await response.json();
        setPublicKey(data.publicKey);

        // 구독 상태 확인
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('서비스 워커 또는 알림 설정 초기화 오류:', error);
      }
    };

    checkSupport();
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isPushSupported) {
      showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission === 'granted') {
        showToast('알림 권한이 허용되었습니다!', 'success');
        return true;
      } else {
        showToast('알림을 허용해야 견적 관련 소식을 받을 수 있습니다.', 'info');
        return false;
      }
    } catch (error) {
      console.error('알림 권한 요청 중 오류 발생:', error);
      showError('알림 권한을 요청하는 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 푸시 알림 구독
  const subscribeToPushNotifications = async (): Promise<boolean> => {
    if (!isPushSupported || !swRegistration || !publicKey) {
      showToast('푸시 알림을 설정할 수 없습니다.', 'error');
      return false;
    }

    // 권한 확인 및 요청
    if (permissionState !== 'granted') {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) return false;
    }

    try {
      // 이미 구독되어 있는지 확인
      let subscription = await swRegistration.pushManager.getSubscription();
      
      // 기존 구독이 있으면 해지 후 재구독
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      // 새 구독 생성
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 서버에 구독 정보 전송
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('서버에 구독 정보를 저장하는데 실패했습니다.');
      }

      setIsSubscribed(true);
      showToast('알림 설정이 완료되었습니다!', 'success');
      return true;
    } catch (error) {
      console.error('푸시 알림 구독 중 오류 발생:', error);
      showError('알림 설정 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 푸시 알림 구독 취소
  const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
    if (!isPushSupported || !swRegistration) {
      return false;
    }

    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return true;
      }

      // 서버에 구독 취소 알림
      const response = await fetch('/api/push-notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      // 클라이언트에서 구독 취소
      const success = await subscription.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
        showToast('알림 구독이 취소되었습니다.', 'info');
        return true;
      } else {
        throw new Error('구독 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('푸시 알림 구독 취소 중 오류 발생:', error);
      showError('알림 구독 취소 중 오류가 발생했습니다.');
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isSubscribed,
        isPushSupported,
        permissionState,
        subscribeToPushNotifications,
        unsubscribeFromPushNotifications,
        requestNotificationPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};