'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getQuoteRequestDetails } from '../../../../api/quotation';
import { getPaymentByQuoteResponse } from '../../../../api/payment';
import { createReview } from '../../../../api/review';

interface CreateReviewPageProps {
  params: {
    quoteResponseId: string;
  };
}

const CreateReviewPage: React.FC<CreateReviewPageProps> = ({ params }) => {
  const quoteResponseId = parseInt(params.quoteResponseId);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    tags: [] as string[],
    isPublic: true,
  });
  
  useEffect(() => {
    // 비로그인 상태 또는 고객 회원이 아닌 경우 리디렉션
    if (!isAuthenticated) {
      router.push(`/login?redirect=/reviews/create/${quoteResponseId}`);
      return;
    }
    
    if (user && user.role !== 'CUSTOMER') {
      router.push('/dashboard');
      return;
    }
    
    fetchServiceDetails();
  }, [isAuthenticated, user, quoteResponseId, router]);
  
  // 서비스 상세 정보 가져오기
  const fetchServiceDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 결제 정보 조회
      const paymentData = await getPaymentByQuoteResponse(quoteResponseId);
      setPayment(paymentData);
      
      // 견적 요청 정보 조회
      const requestId = paymentData.quoteResponseId;
      const quoteDetails = await getQuoteRequestDetails(requestId);
      
      // 선택된 견적 응답 찾기
      let selectedResponse;
      
      if (quoteDetails.offers) {
        selectedResponse = quoteDetails.offers.find((offer: any) => offer.id === quoteResponseId);
      }
      
      if (!selectedResponse) {
        throw new Error('선택한 견적 제안을 찾을 수 없습니다.');
      }
      
      // 서비스 상세 정보 설정
      setServiceDetails({
        request: quoteDetails.request,
        response: selectedResponse,
        business: {
          id: selectedResponse.businessId,
          name: selectedResponse.businessName,
        },
      });
    } catch (error: any) {
      console.error('서비스 상세 조회 실패:', error);
      setError(error.message || '서비스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 별점 변경 핸들러
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating,
    }));
  };
  
  // 태그 선택/해제 핸들러
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const tags = [...prev.tags];
      const index = tags.indexOf(tag);
      
      if (index === -1) {
        // 태그 추가
        return { ...prev, tags: [...tags, tag] };
      } else {
        // 태그 제거
        tags.splice(index, 1);
        return { ...prev, tags };
      }
    });
  };
  
  // 공개 여부 변경 핸들러
  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isPublic: e.target.checked,
    }));
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.content.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        quoteResponseId,
        rating: formData.rating,
        content: formData.content,
        tags: formData.tags,
        isPublic: formData.isPublic,
      };
      
      await createReview(reviewData);
      
      router.push('/reviews/success');
    } catch (error: any) {
      console.error('리뷰 작성 실패:', error);
      setError(error.response?.data?.message || '리뷰 작성에 실패했습니다.');
      setIsSubmitting(false);
    }
  };
  
  // 제안된 태그 목록
  const suggestedTags = [
    '친절해요',
    '깔끔해요',
    '시간약속을 잘 지켜요',
    '가격이 합리적이에요',
    '꼼꼼해요',
    '전문성이 있어요',
    '설명이 자세해요',
    '응대가 빨라요',
    '또 이용하고 싶어요',
    '애견을 잘 다뤄요',
  ];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          뒤로 가기
        </button>
      </div>
    );
  }
  
  if (!serviceDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>서비스 정보를 찾을 수 없습니다.</p>
        </div>
        <button
          onClick={() => router.push('/payments/history')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          결제 내역으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">리뷰 작성</h1>
      
      {/* 서비스 요약 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">{serviceDetails.business.name}</h2>
            <p className="text-gray-600">
              {serviceDetails.request.petBreed} ({serviceDetails.request.petWeight}kg)
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{serviceDetails.response.price.toLocaleString()}원</p>
            <p className="text-sm text-gray-500">
              {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
      
      {/* 리뷰 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* 별점 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            별점
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="text-3xl focus:outline-none"
              >
                {star <= formData.rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        
        {/* 태그 선택 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            태그 선택 (선택사항)
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* 리뷰 내용 */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
            리뷰 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="서비스에 대한 솔직한 경험을 남겨주세요."
            required
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            최소 10자 이상 작성해주세요.
          </p>
        </div>
        
        {/* 공개 여부 */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handlePublicChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">이 리뷰를 공개합니다</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-6">
            비공개 리뷰는 업체와 관리자만 볼 수 있습니다.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded mr-4 hover:bg-gray-400"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? '제출 중...' : '리뷰 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReviewPage;