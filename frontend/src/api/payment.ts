// import apiClient from './auth'; // 잘못된 import
import apiClient from './client'; // 올바른 API 클라이언트 import

// 결제 정보 인터페이스
export interface Payment {
  id: number;
  customerId: number;
  customerName?: string;
  businessId: number;
  businessName?: string;
  quoteResponseId: number;
  amount: number;
  paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT' | 'ACCOUNT_TRANSFER' | 'PHONE' | 'KAKAO_PAY' | 'TOSS_PAY' | 'NAVER_PAY' | 'PAYCO';
  status: 'PENDING' | 'READY' | 'IN_PROGRESS' | 'DONE' | 'CANCELED' | 'FAILED' | 'EXPIRED';
  paymentKey?: string;
  receiptUrl?: string;
  orderId: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 토스페이먼츠 결제 준비 응답
export interface TossPaymentPrepareResponse {
  paymentKey?: string;
  orderId: string;
  amount: number;
  customerKey?: string;
  successUrl: string;
  failUrl: string;
  windowTarget?: string;
  callbackUrl?: string;
  checkoutUrl: string; // 실제 결제 페이지 URL
  mobileRedirectUrl?: string;
}

// 카카오페이 결제 준비 응답
export interface KakaoPayPrepareResponse {
  tid: string; // 결제 고유 번호
  next_redirect_pc_url: string; // PC 웹 결제 페이지 URL
  next_redirect_mobile_url: string; // 모바일 웹 결제 페이지 URL
  next_redirect_app_url: string; // 모바일 앱 결제 페이지 URL
  created_at: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  partner_order_id: string; // 주문 ID
}

// 토스페이먼츠 결제 준비
export const prepareTossPayment = async (quoteResponseId: number) => {
  try {
    const response = await apiClient.post('/payments/toss/prepare', null, {
      params: { quoteResponseId },
    });
    return response.data as TossPaymentPrepareResponse;
  } catch (error) {
    console.error('토스페이먼츠 결제 준비 실패:', error);
    throw error;
  }
};

// 카카오페이 결제 준비
export const prepareKakaoPayment = async (quoteResponseId: number) => {
  try {
    const response = await apiClient.post('/payments/kakao/prepare', null, {
      params: { quoteResponseId },
    });
    return response.data as KakaoPayPrepareResponse;
  } catch (error) {
    console.error('카카오페이 결제 준비 실패:', error);
    throw error;
  }
};

// 토스페이먼츠 결제 승인
export const confirmTossPayment = async (paymentKey: string, orderId: string, amount: number) => {
  try {
    const response = await apiClient.post('/payments/toss/confirm', null, {
      params: { paymentKey, orderId, amount },
    });
    return response.data;
  } catch (error) {
    console.error('토스페이먼츠 결제 승인 실패:', error);
    throw error;
  }
};

// 카카오페이 결제 승인
export const confirmKakaoPayment = async (
  pgToken: string,
  partnerOrderId: string,
  partnerUserId: string,
  tid: string
) => {
  try {
    const response = await apiClient.post('/payments/kakao/confirm', null, {
      params: { pg_token: pgToken, partner_order_id: partnerOrderId, partner_user_id: partnerUserId, tid },
    });
    return response.data;
  } catch (error) {
    console.error('카카오페이 결제 승인 실패:', error);
    throw error;
  }
};

// 결제 취소
export const cancelPayment = async (paymentId: number, cancelReason: string) => {
  try {
    const response = await apiClient.post(`/payments/${paymentId}/cancel`, null, {
      params: { cancelReason },
    });
    return response.data;
  } catch (error) {
    console.error('결제 취소 실패:', error);
    throw error;
  }
};

// 고객의 결제 내역 조회
export const getCustomerPaymentHistory = async () => {
  try {
    const response = await apiClient.get('/payments/customer/history');
    return response.data as Payment[];
  } catch (error) {
    console.error('결제 내역 조회 실패:', error);
    throw error;
  }
};

// 업체의 결제 내역 조회
export const getBusinessPaymentHistory = async () => {
  try {
    const response = await apiClient.get('/payments/business/history');
    return response.data as Payment[];
  } catch (error) {
    console.error('결제 내역 조회 실패:', error);
    throw error;
  }
};

// 결제 상세 조회
export const getPaymentDetails = async (paymentId: number) => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data as Payment;
  } catch (error) {
    console.error('결제 상세 조회 실패:', error);
    throw error;
  }
};

// 견적 응답에 연결된 결제 정보 조회
export const getPaymentByQuoteResponse = async (quoteResponseId: number) => {
  try {
    const response = await apiClient.get(`/payments/by-quote-response/${quoteResponseId}`);
    return response.data as Payment;
  } catch (error) {
    console.error('결제 정보 조회 실패:', error);
    throw error;
  }
};

// 가상 결제 처리 (개발 및 테스트용)
export const processVirtualPayment = async (
  quoteResponseId: number,
  paymentMethod: Payment['paymentMethod'] = 'CARD'
) => {
  try {
    const response = await apiClient.post('/payments/virtual-payment', null, {
      params: { quoteResponseId, paymentMethod },
    });
    return response.data;
  } catch (error) {
    console.error('가상 결제 처리 실패:', error);
    throw error;
  }
};