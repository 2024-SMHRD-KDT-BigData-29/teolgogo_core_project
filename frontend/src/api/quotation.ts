// src/api/quotation.ts
// 견적 요청 관련 API 함수들을 제공합니다.

import apiClient from './client';

// 견적 요청 항목 인터페이스
export interface QuoteItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  type: string;
}

// 견적 요청 생성 인터페이스
export interface CreateQuoteRequest {
  petType: 'DOG' | 'CAT' | 'OTHER';
  petBreed: string;
  petAge: number;
  petWeight: number;
  serviceType: 'BASIC' | 'SPECIAL' | 'BATH' | 'STYLING';
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  preferredDate?: string;
  items?: QuoteItem[];
}

// 견적 요청 인터페이스
export interface QuoteRequest extends CreateQuoteRequest {
  id: number;
  customerId: number;
  customerName: string;
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  reviewStatus: 'NOT_REVIEWED' | 'REVIEWED';
  createdAt: string;
}

// 견적 응답(제안) 인터페이스
export interface QuoteResponse {
  id: number;
  quoteRequestId: number;
  businessId: number;
  businessName: string;
  price: number;
  description?: string;
  estimatedTime?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  paymentStatus: 'NOT_PAID' | 'PAID' | 'REFUNDED';
  availableDate?: string;
  createdAt: string;
}

// 견적 요청 상세 조회 응답 인터페이스
export interface QuoteRequestDetails {
  request: QuoteRequest;
  items: QuoteItem[];
  offers?: QuoteResponse[]; // 고객용
  myOffers?: QuoteResponse[]; // 업체용
}

// 견적 요청 생성 함수
export const createQuotationRequest = async (requestData: CreateQuoteRequest | any, petPhotos?: File[]) => {
  try {
    // FormData를 사용하는 경우 (파일 업로드가 있을 때)
    if (petPhotos && petPhotos.length > 0) {
      const formData = new FormData();
      
      // JSON 데이터를 FormData에 추가
      formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      
      // 반려동물 사진 추가
      petPhotos.forEach(file => {
        formData.append('petPhotos', file);
      });
      
      const response = await apiClient.post('/quotes/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // 일반 JSON 요청 (파일 업로드가 없을 때)
      const response = await apiClient.post('/quotes/requests', requestData);
      return response.data;
    }
  } catch (error) {
    console.error('견적 요청 생성 실패:', error);
    throw error;
  }
};

// 견적 요청 목록 가져오기
export const getQuotationRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/quotes/requests', { params }); // '/quotation/requests'에서 변경
    return response.data;
  } catch (error) {
    console.error('견적 요청 목록 가져오기 실패:', error);
    throw error;
  }
};

// 고객의 견적 요청 목록 조회
export const getCustomerQuoteRequests = async () => {
  try {
    const response = await apiClient.get('/quotes/customer/requests');
    return response.data;
  } catch (error) {
    console.error('견적 요청 목록 조회 실패:', error);
    throw error;
  }
};

// 견적 요청 상세 정보 가져오기
export const getQuotationRequest = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/quotes/requests/${id}`); // `/quotation/requests/${id}`에서 변경
    return response.data;
  } catch (error) {
    console.error('견적 요청 상세 정보 가져오기 실패:', error);
    throw error;
  }
};

// 견적 요청 상세 조회 (더 자세한 인터페이스 제공)
export const getQuoteRequestDetails = async (requestId: number | string): Promise<QuoteRequestDetails> => {
  try {
    const response = await apiClient.get(`/quotes/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('견적 요청 상세 조회 실패:', error);
    throw error;
  }
};

// 업체가 볼 수 있는 견적 요청 목록 조회 (위치 기반)
export const getAvailableQuoteRequests = async (
  latitude?: number,
  longitude?: number,
  radius?: number
) => {
  try {
    let url = '/quotes/business/available';
    const params: Record<string, string> = {};
    
    if (latitude) params.latitude = latitude.toString();
    if (longitude) params.longitude = longitude.toString();
    if (radius) params.radius = radius.toString();
    
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('견적 요청 목록 조회 실패:', error);
    throw error;
  }
};

// 견적 제안하기 (업체용)
export const createQuotationOffer = async (requestId: string | number, offerData: any | Partial<QuoteResponse>) => {
  try {
    const response = await apiClient.post(`/quotes/requests/${requestId}/offers`, offerData); // `/quotation/requests/${requestId}/offers`에서 변경
    return response.data;
  } catch (error) {
    console.error('견적 제안 실패:', error);
    throw error;
  }
};

// 견적 수락하기 (고객용)
export const acceptQuotationOffer = async (requestId: string | number, offerId: string | number) => {
  try {
    const response = await apiClient.post(`/quotes/requests/${requestId}/offers/${offerId}/accept`); // `/quotation/requests/${requestId}/offers/${offerId}/accept`에서 변경
    return response.data;
  } catch (error) {
    console.error('견적 수락 실패:', error);
    throw error;
  }
};

// 미용 완료 후 사진 업로드 (업체용)
export const uploadGroomingPhotos = async (
  responseId: number,
  beforePhotos?: File[],
  afterPhotos?: File[]
) => {
  try {
    const formData = new FormData();
    
    // 미용 전 사진 추가
    if (beforePhotos && beforePhotos.length > 0) {
      beforePhotos.forEach(file => {
        formData.append('beforePhotos', file);
      });
    }
    
    // 미용 후 사진 추가
    if (afterPhotos && afterPhotos.length > 0) {
      afterPhotos.forEach(file => {
        formData.append('afterPhotos', file);
      });
    }
    
    const response = await apiClient.post(`/quotes/responses/${responseId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('미용 사진 업로드 실패:', error);
    throw error;
  }
};

export default {
  createQuotationRequest,
  getQuotationRequests,
  getQuotationRequest,
  getCustomerQuoteRequests,
  getQuoteRequestDetails,
  getAvailableQuoteRequests,
  createQuotationOffer,
  acceptQuotationOffer,
  uploadGroomingPhotos
};