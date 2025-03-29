// src/app/quotes/page.tsx
// 견적 요청 목록을 표시하는 페이지 - 고객은 자신의 견적 요청, 업체는 가능한 견적 요청 조회

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCustomerQuoteRequests, getAvailableQuoteRequests, QuoteRequest } from '@/api/quotation';
import { useLocation } from '@/hooks/useLocation';


export default function QuotesListPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { getCurrentLocation } = useLocation();
  
  // 견적 요청 목록 상태
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 사용자 위치 (업체 사용자용)
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [radius, setRadius] = useState<number>(5); // 기본 반경 5km

    
  useEffect(() => {
    if (authLoading) return; // 인증 상태 로딩 중이면 대기
    
    // 비로그인 상태인 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/quotes');
      return;
    }
    
    fetchQuotes();
  }, [isAuthenticated, user, authLoading, router, latitude, longitude, radius]);
  
  // 견적 요청 목록 가져오기
  const fetchQuotes = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let response;
      
      if (user?.role === 'CUSTOMER') {
        // 고객 회원인 경우 자신의 견적 요청 목록 가져오기
        response = await getCustomerQuoteRequests();
      } else if (user?.role === 'BUSINESS') {
        // 업체 회원인 경우 위치 기반 견적 요청 목록 가져오기
        response = await getAvailableQuoteRequests(latitude, longitude, radius);
      } else {
        throw new Error('알 수 없는 사용자 유형입니다.');
      }
      
      setQuotes(response);
    } catch (error: any) {
      console.error('견적 요청 목록 조회 실패:', error);
      setError(error.response?.data?.message || '견적 요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 현재 위치 가져오기 (업체 회원용)
  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      setError('위치 정보를 가져오는데 실패했습니다. 새로고침 후 다시 시도해주세요.');
    }
  };
  
  // 요청 상태에 따른 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFERED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': // 구버전 상태 지원
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      case 'IN_PROGRESS': // 구버전 상태 지원
        return '진행 중';
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
        return type || '기타';
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
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'CUSTOMER' ? '내 견적 요청 목록' : '견적 요청 찾기'}
        </h1>
        
        {user?.role === 'CUSTOMER' && (
          <Link 
            href="/quotes/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + 새 견적 요청
          </Link>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 업체 회원용 위치 설정 */}
      {user?.role === 'BUSINESS' && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">위치 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">위도</label>
              <input
                type="number"
                value={latitude || ''}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || undefined)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="예: 37.5665"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">경도</label>
              <input
                type="number"
                value={longitude || ''}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || undefined)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="예: 126.9780"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">반경 (km)</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 5)}
                className="w-full p-2 border border-gray-300 rounded"
                min="1"
                max="50"
              />
            </div>
          </div>
          
          <div className="flex mt-4">
            <button
              onClick={handleGetCurrentLocation}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              현재 위치 사용
            </button>
            
            <button
              onClick={fetchQuotes}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              견적 요청 검색
            </button>
          </div>
        </div>
      )}
      
      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <h2 className="text-lg font-medium mb-2">견적 요청이 없습니다</h2>
          {user?.role === 'CUSTOMER' ? (
            <p className="text-gray-600 mb-4">
              첫 번째 견적 요청을 작성해보세요.
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              현재 위치 주변에 견적 요청이 없습니다. 다른 위치나 더 넓은 반경으로 검색해보세요.
            </p>
          )}
          
          {user?.role === 'CUSTOMER' && (
            <Link
              href="/quotes/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              새 견적 요청 작성하기
            </Link>
          )}
        </div>
      ) : (
        // 카드 스타일 레이아웃 (신버전)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Link 
              href={`/quotes/${quote.id}`} 
              key={quote.id}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </span>
                    {quote.reviewStatus === 'REVIEWED' && (
                      <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        리뷰 완료
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(quote.createdAt)}
                  </span>
                </div>
                
                {/* <h3 className="text-lg font-semibold mb-2">
                  {quote.petType ? (
                    <>
                      {getPetTypeText(quote.petType)} {quote.petBreed} - {getServiceTypeText(quote.serviceType)}
                    </>
                  ) : (
                    // 구버전 지원 (petType이 없는 경우)
                    quote.title || getServiceTypeText(quote.serviceType)
                  )}
                </h3> */}

                <h3 className="text-lg font-semibold mb-2">
                  {quote.petType ? (
                    <>
                      {getPetTypeText(quote.petType)} {quote.petBreed} - {getServiceTypeText(quote.serviceType)}
                    </>
                  ) : (
                    // 구버전 지원 (petType이 없는 경우)
                    (quote as any).title || getServiceTypeText(quote.serviceType)
                  )}
                </h3>
                
                {quote.petWeight && quote.petAge && (
                  <div className="text-sm text-gray-600 mb-2">
                    <p>체중: {quote.petWeight}kg / 나이: {quote.petAge}개월</p>
                  </div>
                )}
                
                {quote.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {quote.description}
                  </p>
                )}
                
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-1">주소: {quote.address}</p>
                  {quote.preferredDate && (
                    <p>희망일: {formatDate(quote.preferredDate)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}