'use client';

import React from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const {
    isSubscribed,
    isPushSupported,
    subscribe,
    unsubscribe,
    browserInfo
  } = usePushNotification();

  if (!isPushSupported) {
    return (
      <div className={`rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/30 p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">알림 지원 불가</h3>
            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                {browserInfo.isIOS ? 
                  'iOS Safari는 웹 푸시 알림을 지원하지 않습니다. Chrome이나 다른 브라우저를 사용해주세요.' :
                  '이 브라우저는 푸시 알림을 지원하지 않습니다. 최신 브라우저로 업데이트하거나 다른 브라우저를 사용해주세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border dark:border-gray-700 p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">알림 설정</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            푸시 알림
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            견적 요청, 제안, 수락 등의 중요 알림을 받아보세요.
          </p>
        </div>
        
        <div className="relative inline-block">
          {isSubscribed ? (
            <button
              onClick={unsubscribe}
              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-md text-sm"
            >
              알림 중지
            </button>
          ) : (
            <button
              onClick={subscribe}
              className="px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md text-sm"
            >
              알림 허용
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {isSubscribed ? (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>알림이 활성화되었습니다</span>
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>알림이 비활성화되어 있습니다</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;