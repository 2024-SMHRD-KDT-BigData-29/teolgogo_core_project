'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getQuoteRequestDetails, createQuotationOffer as createQuoteOffer } from '../../../../api/quotation';

// 컴포넌트 타입 정의
interface CreateOfferPageProps {
  params: {
    id: string;
  };
}

const CreateOfferPage: React.FC<CreateOfferPageProps> = ({ params }) => {
  const quoteId = parseInt(params.id);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    price: 0,
    description: '',
    estimatedTime: '',
    availableDate: '',
  });
  
  useEffect(() => {
    // 비로그인 상태 또는 고객 회원인 경우 리디렉션
    if (!isAuthenticated) {
      router.push(`/login?redirect=/quotes/${quoteId}/offer`);
      return;
    }
    
    if (user && user.role !== 'BUSINESS') {
      router.push('/dashboard');
      return;
    }
    
    fetchQuoteDetails();
  }, [isAuthenticated, user, quoteId, router]);
  
  // 견적 요청 상세 정보 가져오기
  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getQuoteRequestDetails(quoteId);
      setQuoteDetails(response);
      
      // 이미 제안한 견적이 있는지 확인
      if (response.myOffers && response.myOffers.length > 0) {
        router.push(`/quotes/${quoteId}`);
        return;
      }
      
      // 이미 처리된 요청인지 확인
      if (response.request.status !== 'PENDING' && response.request.status !== 'OFFERED') {
        setError('이미 처리된 견적 요청입니다.');
      }
    } catch (error: any) {
      console.error('견적 요청 상세 조회 실패:', error);
      setError(error.response?.data?.message || '견적 요청 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value,
    }));
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 필수 필드 검증
    if (formData.price <= 0) {
      setError('가격을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createQuoteOffer(quoteId, formData);
      router.push(`/quotes/${quoteId}?offer=success`);
    } catch (error: any) {
      console.error('견적 제안 생성 실패:', error);
      setError(error.response?.data?.message || '견적 제안 생성에 실패했습니다.');
      setIsSubmitting(false);
    }
  };
  
  // 요청 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'OFFERED':
        return '제안 있음';
      case 'ACCEPTED':
        return '수락됨';
      case 'COMPLETED':
        return '완료됨';
      case 'CANCELLED':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };
  
  // 서비스 타입에 따른 한글 텍스트
  const getServiceTypeText = (type: string) => {
    switch (type) {
      case 'BASIC':
        return '기본 미용';
      case 'SPECIAL':
        return '스페셜 케어';
      case 'BATH':
        return '목욕/위생';
      case 'STYLING':
        return '스타일링';
      default:
        return '기타';
    }
  };
  
  // 반려동물 타입에 따른 한글 텍스트
  const getPetTypeText = (type: string) => {
    switch (type) {
      case 'DOG':
        return '강아지';
      case 'CAT':
        return '고양이';
      case 'OTHER':
        return '기타';
      default:
        return '알 수 없음';
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
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
          onClick={() => router.push(`/quotes/${quoteId}`)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          견적 요청 상세로 돌아가기
        </button>
      </div>
    );
  }
  
  if (!quoteDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>견적 요청 정보를 찾을 수 없습니다.</p>
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
  
  const { request, items } = quoteDetails;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/quotes/${quoteId}`)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mb-4"
        >
          견적 요청 상세로 돌아가기
        </button>
        
        <h1 className="text-3xl font-bold">견적 제안하기</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 견적 요청 요약 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">요청 정보</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">상태</p>
                <p className="font-medium">{getStatusText(request.status)}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">반려동물</p>
                <p className="font-medium">{getPetTypeText(request.petType)} ({request.petBreed})</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">정보</p>
                <p className="font-medium">{request.petAge}개월 / {request.petWeight}kg</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">서비스 종류</p>
                <p className="font-medium">{getServiceTypeText(request.serviceType)}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">희망 날짜</p>
                <p className="font-medium">
                  {request.preferredDate ? new Date(request.preferredDate).toLocaleString('ko-KR') : '지정 없음'}
                </p>
              </div>
              
              {request.description && (
                <div>
                  <p className="text-gray-600 text-sm">요청 사항</p>
                  <p className="whitespace-pre-line">{request.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 서비스 항목 요약 */}
          {items && items.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">요청 서비스 항목</h2>
              
              <ul className="space-y-2">
                {items.map((item: any) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.price.toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold">
                <span>총 예상 금액</span>
                <span>
                  {items.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString()}원
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* 견적 제안 폼 */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">견적 정보 입력</h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                가격 (원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 50000"
                min="1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                최종 고객 결제 금액이 됩니다.
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="estimatedTime" className="block text-gray-700 font-medium mb-2">
                예상 소요 시간
              </label>
              <input
                type="text"
                id="estimatedTime"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 1시간 30분"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="availableDate" className="block text-gray-700 font-medium mb-2">
                가능한 날짜/시간
              </label>
              <input
                type="datetime-local"
                id="availableDate"
                name="availableDate"
                value={formData.availableDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                고객이 희망한 날짜가 있는 경우 최대한 맞추는 것이 좋습니다.
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                견적 설명 및 메모
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="서비스 내용, 주의사항, 특이사항 등을 자세히 설명해주세요."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/quotes/${quoteId}`)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? '제출 중...' : '견적 제안하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferPage;