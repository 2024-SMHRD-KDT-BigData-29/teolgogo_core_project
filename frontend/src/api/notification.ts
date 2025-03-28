// api/notification.ts
// 푸시 알림 : 카카오톡 푸시 알림을 위한 서비스

import apiClient from './client';

// 견적 요청 알림 발송 (인근 업체에 견적 요청 알림)
export const sendQuotationRequestNotification = async (requestId: string) => {
  try {
    const response = await apiClient.post(`/notifications/quotation-request/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('견적 요청 알림 발송 실패:', error);
    throw error;
  }
};

// 견적 제안 알림 발송 (고객에게 견적 제안 알림)
export const sendQuotationOfferNotification = async (offerId: string) => {
  try {
    const response = await apiClient.post(`/notifications/quotation-offer/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('견적 제안 알림 발송 실패:', error);
    throw error;
  }
};

// 견적 수락 알림 발송 (업체에게 견적 수락 알림)
export const sendQuotationAcceptNotification = async (offerId: string) => {
  try {
    const response = await apiClient.post(`/notifications/quotation-accept/${offerId}`);
    return response.data;
  } catch (error) {
    console.error('견적 수락 알림 발송 실패:', error);
    throw error;
  }
};