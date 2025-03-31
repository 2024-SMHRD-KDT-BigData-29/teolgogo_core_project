/**
 * base64 문자열을 Uint8Array로 변환하는 유틸리티 함수
 * 웹 푸시 API에서 applicationServerKey로 사용하기 위함
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
  
  /**
   * 푸시 알림 기능이 지원되는지 확인하는 함수
   */
  export function isPushNotificationSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }
  
  /**
   * 사용자의 브라우저 정보 가져오기
   * 모바일 디바이스 여부 등 확인에 사용
   */
  export function getBrowserInfo(): {
    name: string;
    version: string;
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
  } {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let isMobile = false;
    let isIOS = false;
    let isAndroid = false;
  
    // 모바일 장치 확인
    if (/Android/i.test(userAgent)) {
      name = 'Android';
      isAndroid = true;
      isMobile = true;
      const match = userAgent.match(/Android\s([0-9\.]+)/);
      if (match) version = match[1];
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      name = 'iOS';
      isIOS = true;
      isMobile = true;
      const match = userAgent.match(/OS\s([0-9_]+)/);
      if (match) version = match[1].replace(/_/g, '.');
    } else if (/Chrome/i.test(userAgent)) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/([0-9\.]+)/);
      if (match) version = match[1];
    } else if (/Firefox/i.test(userAgent)) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/([0-9\.]+)/);
      if (match) version = match[1];
    } else if (/Safari/i.test(userAgent)) {
      name = 'Safari';
      const match = userAgent.match(/Safari\/([0-9\.]+)/);
      if (match) version = match[1];
    } else if (/Edge/i.test(userAgent)) {
      name = 'Edge';
      const match = userAgent.match(/Edge\/([0-9\.]+)/);
      if (match) version = match[1];
    }
  
    return {
      name,
      version,
      isMobile,
      isIOS,
      isAndroid
    };
  }
  
  /**
   * 사용자에게 표시할 알림 문구 생성
   */
  export function getNotificationMessage(type: string, data: any): {
    title: string;
    body: string;
    icon: string;
    url: string;
  } {
    let title = '털고고';
    let body = '새로운 알림이 도착했습니다.';
    let icon = '/icons/icon-192x192.png';
    let url = '/';
  
    switch (type) {
      case 'quote_request':
        title = '새로운 견적 요청';
        body = `${data.customerName}님의 ${data.serviceType} 견적 요청이 도착했습니다.`;
        url = `/business/quotation/${data.requestId}`;
        break;
        
      case 'quote_offer':
        title = '견적 제안 도착';
        body = `${data.businessName} 업체에서 ${data.price}원의 견적을 제안했습니다.`;
        url = `/quotation/${data.requestId}`;
        break;
        
      case 'quote_accept':
        title = '견적 수락 알림';
        body = `${data.customerName}님이 귀하의 견적 제안을 수락했습니다.`;
        url = `/business/quotation/${data.offerId}/dashboard`;
        break;
        
      case 'grooming_completed':
        title = '미용 완료 알림';
        body = `${data.businessName} 업체에서 반려동물 미용이 완료되었다는 알림을 보냈습니다.`;
        url = `/reviews/create/${data.responseId}`;
        break;
        
      case 'new_review':
        title = '새 리뷰 등록';
        body = `${data.customerName}님이 ${data.rating}점의 리뷰를 남겼습니다.`;
        url = '/business/reviews';
        break;
    }
  
    return { title, body, icon, url };
  }