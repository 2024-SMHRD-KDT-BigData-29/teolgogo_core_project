const CACHE_NAME = 'teolgogo-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/css/pwa-styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 서비스 워커 설치 및 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기');
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾았다면 해당 응답 반환
        if (response) {
          return response;
        }
        // 캐시에 없다면 실제 네트워크 요청 수행
        return fetch(event.request).then(
          response => {
            // 유효한 응답이 아니면 그냥 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 중요 API 응답이 아닌 리소스만 캐싱 (복제 후 사용)
            const responseToCache = response.clone();
            
            if (!event.request.url.includes('/api/')) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      })
  );
});

// 캐시 정리
self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// PWA가 standalone 모드로 실행될 때 실행되는 코드
self.addEventListener('fetch', event => {
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