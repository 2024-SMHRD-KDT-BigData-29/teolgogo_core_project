// import apiClient from './auth'; // 잘못된 import
import apiClient from './client'; // 올바른 API 클라이언트 import

// 리뷰 인터페이스
export interface Review {
  id: number;
  customerId: number;
  customerName?: string;
  businessId: number;
  businessName?: string;
  quoteResponseId: number;
  rating: number;
  content: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 리뷰 생성 요청 인터페이스
export interface CreateReviewRequest {
  quoteResponseId: number;
  rating: number;
  content: string;
  tags?: string[];
  isPublic?: boolean;
}

// 리뷰 조회 필터 인터페이스
export interface ReviewFilter {
  customerId?: number;
  businessId?: number;
  minRating?: number;
  maxRating?: number;
  tags?: string[];
}

// 리뷰 생성
export const createReview = async (reviewData: CreateReviewRequest): Promise<Review> => {
  try {
    const response = await apiClient.post('/api/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('리뷰 생성 실패:', error);
    throw error;
  }
};

// 업체 리뷰 목록 조회
export const getBusinessReviews = async (businessId: number, filter?: Partial<ReviewFilter>): Promise<Review[]> => {
  try {
    const response = await apiClient.get(`/api/reviews/business/${businessId}`, {
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error('업체 리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 고객 리뷰 목록 조회
export const getCustomerReviews = async (): Promise<Review[]> => {
  try {
    const response = await apiClient.get('/api/reviews/customer');
    return response.data;
  } catch (error) {
    console.error('고객 리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 리뷰 상세 조회
export const getReviewDetails = async (reviewId: number): Promise<Review> => {
  try {
    const response = await apiClient.get(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('리뷰 상세 조회 실패:', error);
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId: number, reviewData: Partial<CreateReviewRequest>): Promise<Review> => {
  try {
    const response = await apiClient.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};

// 리뷰 작성 가능 여부 확인
export const checkReviewEligibility = async (quoteResponseId: number): Promise<{ eligible: boolean; message?: string }> => {
  try {
    const response = await apiClient.get(`/api/reviews/check-eligibility/${quoteResponseId}`);
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 가능 여부 확인 실패:', error);
    throw error;
  }
};

// 평균 평점 및 리뷰 통계 조회
export const getBusinessReviewStats = async (businessId: number): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  popularTags: { tag: string; count: number }[];
}> => {
  try {
    const response = await apiClient.get(`/api/reviews/stats/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error('리뷰 통계 조회 실패:', error);
    throw error;
  }
};

// 특정 서비스(견적 응답)에 대한 리뷰 조회
export const getQuoteResponseReview = async (quoteResponseId: number): Promise<Review | null> => {
  try {
    const response = await apiClient.get(`/api/reviews/quote-response/${quoteResponseId}`);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        error.response.status === 404) {
      return null;
    }
    console.error('서비스 리뷰 조회 실패:', error);
    throw error;
  }
};