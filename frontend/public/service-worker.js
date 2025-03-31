// public/service-worker.js

/**
 * 웹 푸시 알림을 처리하는 서비스 워커
 */

// 서비스 워커 버전 (업데이트 시 변경)
const VERSION = '1.0.0';

// 캐시 이름
const CACHE_NAME = `teolgogo-cache-${VERSION}`;

// 캐시할 정적 리소스
const STATIC_RESOURCES = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/css/pwa-styles.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// 서비스 워커 설치 시 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 정적 자원 캐싱 중...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] 캐싱 완료');
        return self.skipWaiting();
      })
  );
});

// 서비스 워커 활성화 시 이전 캐시 제거
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화됨');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] 클라이언트 클레임');
      return self.clients.claim();
    })
  );
});

// 푸시 알림 이벤트 처리
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 푸시 알림 수신:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    console.error('[Service Worker] 푸시 데이터 파싱 오류:', e);
  }
  
  const title = notificationData.title || '털고고';
  const options = {
    body: notificationData.body || '새로운 알림이 있습니다.',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/icon-72x72.png',
    data: {
      url: notificationData.url || '/',
      timestamp: notificationData.timestamp || Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '확인하기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ],
    vibrate: [100, 50, 100],
    timestamp: notificationData.timestamp || Date.now(),
    renotify: false,
    silent: false,
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 알림 클릭됨:', event);
  
  const notification = event.notification;
  const action = event.action;
  const notificationData = notification.data || {};
  const urlToOpen = notificationData.url || '/';
  
  notification.close();
  
  if (action === 'close') {
    return;
  }
  
  // 알림 클릭 시 해당 URL로 이동
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // 이미 열린 창이 있다면 활성화
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client && 'navigate' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // 열린 창이 없다면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 네트워크 요청 처리 (오프라인 지원)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시된 응답 반환
        if (response) {
          return response;
        }
        
        // 없으면 네트워크 요청
        return fetch(event.request).then(
          (response) => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 중요한 요청은 캐시에 복사본 저장 (API 요청 제외)
            const responseToCache = response.clone();
            if (event.request.method === 'GET' && !event.request.url.includes('/api/')) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            
            return response;
          }
        ).catch(() => {
          // 네트워크 요청 실패 시 오프라인 페이지 제공
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// PWA가 standalone 모드로 실행될 때 실행되는 코드
self.addEventListener('fetch', (event) => {
  // PWA 모드 감지 및 스타일 적용
  if (
    event.request.mode === 'navigate' &&
    event.request.destination === 'document' &&
    self.registration.scope === location.origin + '/'
  ) {
    // PWA 모드로 실행 중일 때 특별한 처리를 할 수 있음
    console.log('PWA 모드로 실행 중입니다');
  }
});

// 백그라운드 동기화 이벤트 처리
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] 백그라운드 동기화:', event);
  
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// 대기 중인 요청 동기화 함수 (구현 필요)
async function syncPendingRequests() {
  console.log('[Service Worker] 대기 중인 요청 동기화 중...');
  // 로컬 스토리지나 IndexedDB에서 대기 중인 요청을 처리하는 로직 구현
}