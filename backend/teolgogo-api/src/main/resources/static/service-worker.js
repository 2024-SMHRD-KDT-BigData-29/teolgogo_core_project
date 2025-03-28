const CACHE_NAME = 'teolgogo-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/main.js',
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