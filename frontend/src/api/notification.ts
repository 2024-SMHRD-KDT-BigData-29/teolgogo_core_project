// api/notification.ts
import apiClient from './client';

// 푸시 알림 구독 정보 저장
export const subscribeToPushNotifications = async (subscription: PushSubscription) => {
  try {
    const response = await apiClient.post('/api/push-notifications/subscribe', subscription);
    return response.data;
  } catch (error) {
    console.error('푸시 알림 구독 저장 실패:', error);
    throw error;
  }
};

// 푸시 알림 구독 취소
export const unsubscribeFromPushNotifications = async (endpoint: string) => {
  try {
    const response = await apiClient.post('/api/push-notifications/unsubscribe', { endpoint });
    return response.data;
  } catch (error) {
    console.error('푸시 알림 구독 취소 실패:', error);
    throw error;
  }
};

// 웹 푸시 알림 공개 키 가져오기
export const getPushNotificationPublicKey = async () => {
  try {
    const response = await apiClient.get('/api/push-notifications/public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('푸시 알림 공개 키 가져오기 실패:', error);
    throw error;
  }
};

// 테스트 푸시 알림 전송 (개발 환경에서만 사용)
export const sendTestPushNotification = async () => {
  try {
    const response = await apiClient.post('/api/push-notifications/test');
    return response.data;
  } catch (error) {
    console.error('테스트 푸시 알림 전송 실패:', error);
    throw error;
  }
};

// -- 기존 카카오톡 푸시 알림 API 호출 (향후 사용 가능성을 위해 유지) --

// 견적 요청 알림 발송 (인근 업체에 견적 요청 알림)
export const sendQuotationRequestNotification = async (requestId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/quotation-request/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('견적 요청 알림 발송 실패:', error);
    throw error;
  }
};

// 견적 제안 알림 발송 (고객에게 견적 제안 알림)
export const sendQuotationOfferNotification = async (offerId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/quotation-offer/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('견적 제안 알림 발송 실패:', error);
    throw error;
  }
};

// 견적 수락 알림 발송 (업체에게 견적 수락 알림)
export const sendQuotationAcceptNotification = async (offerId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/quotation-accept/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('견적 수락 알림 발송 실패:', error);
    throw error;
  }
};