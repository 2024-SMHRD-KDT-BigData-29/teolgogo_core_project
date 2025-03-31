// hooks/usePushNotification.ts

import { useState, useEffect } from 'react';

/**
 * 웹 푸시 알림 구독을 관리하는 커스텀 훅
 * 사용자의 알림 권한 상태 확인, 서비스 워커 등록, 구독 생성 및 서버 전송 기능 제공
 */
export default function usePushNotification() {
  // 상태 관리
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  /**
   * 알림 권한 상태를 확인하는 함수
   * @returns 현재 알림 권한 상태 (granted, denied, default)
   */
  const checkPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.error('이 브라우저는 알림을 지원하지 않습니다.');
      return 'denied';
    }
    
    // 현재 알림 권한 상태를 가져옴
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    return permission;
  };

  /**
   * 서비스 워커를 등록하는 함수
   * @returns 등록된 서비스 워커 등록 객체
   */
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.error('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return null;
    }

    try {
      // 서비스 워커 등록
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(reg);
      return reg;
    } catch (error) {
      console.error('서비스 워커 등록 중 오류:', error);
      return null;
    }
  };

  /**
   * 웹 푸시 구독을 생성하고 서버에 전송하는 함수
   * @returns 생성된 구독 객체
   */
  const subscribe = async (): Promise<PushSubscription | null> => {
    // 권한 확인
    const permission = await checkPermission();
    if (permission !== 'granted') {
      console.error('알림 권한이 없습니다.');
      return null;
    }

    // 서비스 워커 등록 확인
    const reg = registration || await registerServiceWorker();
    if (!reg) return null;

    try {
      // 서버에서 공개키 가져오기
      const response = await fetch('/api/notification/vapid-public-key');
      const { publicKey } = await response.json();

      // 구독 옵션 설정
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      };

      // 푸시 구독 생성
      const newSubscription = await reg.pushManager.subscribe(subscribeOptions);
      setSubscription(newSubscription);
      setIsSubscribed(true);

      // 서버에 구독 정보 전송
      await sendSubscriptionToServer(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('푸시 구독 생성 중 오류:', error);
      return null;
    }
  };

  /**
   * 구독 정보를 서버에 전송하는 함수
   * @param subscription 전송할 구독 정보
   */
  const sendSubscriptionToServer = async (subscription: PushSubscription): Promise<void> => {
    try {
      const response = await fetch('/api/notification/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('서버에 구독 정보 전송 실패');
      }
      
      console.log('서버에 구독 정보 전송 성공');
    } catch (error) {
      console.error('서버에 구독 정보 전송 중 오류:', error);
    }
  };

  /**
   * 구독을 취소하는 함수
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      console.error('구독 정보가 없습니다.');
      return false;
    }

    try {
      // 서버에 구독 취소 요청 보내기
      await fetch('/api/notification/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      // 클라이언트에서 구독 취소
      const success = await subscription.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
        setSubscription(null);
        console.log('구독 취소 성공');
      }
      
      return success;
    } catch (error) {
      console.error('구독 취소 중 오류:', error);
      return false;
    }
  };

  /**
   * 기존 구독 상태를 확인하는 함수
   */
  const checkSubscription = async (): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      setRegistration(reg);
      const existingSubscription = await reg.pushManager.getSubscription();
      
      setSubscription(existingSubscription);
      setIsSubscribed(!!existingSubscription);
    } catch (error) {
      console.error('구독 상태 확인 중 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 기존 구독 상태 확인
  useEffect(() => {
    checkPermission();
    checkSubscription();
  }, []);

  return {
    isSubscribed,
    permissionState,
    subscription,
    checkPermission,
    subscribe,
    unsubscribe,
  };
}

/**
 * URL Safe Base64 문자열을 Uint8Array로 변환하는 유틸리티 함수
 * 웹 푸시 API에서 applicationServerKey를 설정할 때 필요함
 * 
 * @param base64String URL Safe Base64 인코딩된 문자열
 * @returns 변환된 Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
}