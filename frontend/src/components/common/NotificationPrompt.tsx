// components/common/NotificationPrompt.tsx
'use client';

import React from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';

const NotificationPrompt: React.FC = () => {
  const {
    isPromptVisible,
    isPushSupported,
    subscribe,
    dismissPrompt
  } = usePushNotification();

  if (!isPromptVisible || !isPushSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">알림 설정</h3>
          </div>
          <button 
            onClick={dismissPrompt} 
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          견적 요청과 견적 제안 등의 중요한 알림을 받아보세요.
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={dismissPrompt}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            나중에
          </button>
          <button
            onClick={subscribe}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md"
          >
            알림 허용
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;