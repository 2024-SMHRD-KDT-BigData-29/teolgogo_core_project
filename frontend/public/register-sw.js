if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('서비스 워커 등록 성공:', registration.scope);
        })
        .catch(function(err) {
          console.log('서비스 워커 등록 실패:', err);
        });
    });
  }