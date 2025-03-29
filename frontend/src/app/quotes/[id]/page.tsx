'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getQuoteRequestDetails, acceptQuotationOffer as acceptQuoteOffer } from '../../../api/quotation';
import { createChatRoom } from '../../../api/chat';
import Link from 'next/link';
import Image from 'next/image';

// 컴포넌트 타입 정의
interface QuoteDetailPageProps {
  params: {
    id: string;
  };
}

// 견적 요청 상세 페이지
const QuoteDetailPage: React.FC<QuoteDetailPageProps> = ({ params }) => {
  const quoteId = parseInt(params.id);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [offerSubmitLoading, setOfferSubmitLoading] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  
  useEffect(() => {
    // 비로그인 상태인 경우 리디렉션
    if (!isAuthenticated) {
      router.push(`/login?redirect=/quotes/${quoteId}`);
      return;
    }
    
    fetchQuoteDetails();
  }, [isAuthenticated, quoteId, router]);
  
  // 견적 요청 상세 정보 가져오기
  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getQuoteRequestDetails(quoteId);
      setQuoteDetails(response);
    } catch (error: any) {
      console.error('견적 요청 상세 조회 실패:', error);
      setError(error.response?.data?.message || '견적 요청 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 견적 제안 수락 핸들러
  const handleAcceptOffer = async (offerId: number) => {
    if (!window.confirm('이 견적을 수락하시겠습니까? 수락 후에는 취소할 수 없습니다.')) {
      return;
    }
    
    setOfferSubmitLoading(true);
    
    try {
      const response = await acceptQuoteOffer(quoteId, offerId);
      
      // 채팅방 생성
      await createChatRoom(quoteId, response.businessId);
      
      // 성공 후 페이지 새로고침
      fetchQuoteDetails();
      
      // 결제 페이지로 이동 (실제 환경에서는 결제 페이지로 이동)
      // router.push(`/payments/${response.id}`);
      
      alert('견적이 성공적으로 수락되었습니다.');
    } catch (error: any) {
      console.error('견적 수락 실패:', error);
      alert(error.response?.data?.message || '견적 수락에 실패했습니다.');
    } finally {
      setOfferSubmitLoading(false);
    }
  };
  
  // 채팅방 생성 핸들러
  const handleCreateChatRoom = async (businessId: number) => {
    try {
      const chatRoom = await createChatRoom(quoteId, businessId);
      router.push(`/chat/${chatRoom.id}`);
    } catch (error: any) {
      console.error('채팅방 생성 실패:', error);
      alert(error.response?.data?.message || '채팅방 생성에 실패했습니다.');
    }
  };
  
  // 사진 미리보기 핸들러
  const openPhotoViewer = (url: string) => {
    setSelectedPhotoUrl(url);
    setPhotoViewerOpen(true);
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
  
  // 서비스 항목 타입에 따른 한글 텍스트
  const getItemTypeText = (type: string) => {
    const itemTypes: Record<string, string> = {
      'BASIC_GROOMING': '기본 미용',
      'SPECIAL_CARE': '스페셜 케어',
      'BATH': '목욕',
      'NAIL_TRIM': '발톱 관리',
      'EAR_CLEANING': '귀 청소',
      'TEETH_BRUSHING': '치아 관리',
      'STYLING': '스타일링',
      'DESHEDDING': '털 관리',
      'FLEA_TREATMENT': '벼룩 방지',
      'CUSTOM': '커스텀 서비스',
    };
    
    return itemTypes[type] || '기타';
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
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          뒤로 가기
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
  
  const { request, items, offers, myOffers } = quoteDetails;
  const isCustomer = user?.id === request.customerId;
  const isBusiness = user?.role === 'BUSINESS';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mb-4"
        >
          뒤로 가기
        </button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">견적 요청 상세</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(request.status)}`}>
            {getStatusText(request.status)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 견적 요청 정보 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">반려동물 종류</p>
                <p className="font-medium">{getPetTypeText(request.petType)}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">품종</p>
                <p className="font-medium">{request.petBreed}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">나이</p>
                <p className="font-medium">{request.petAge}개월</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">체중</p>
                <p className="font-medium">{request.petWeight}kg</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">서비스 종류</p>
                <p className="font-medium">{getServiceTypeText(request.serviceType)}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">희망 날짜</p>
                <p className="font-medium">
                  {request.preferredDate ? formatDate(request.preferredDate) : '지정 없음'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">주소</p>
                <p className="font-medium">{request.address}</p>
              </div>
            </div>
            
            {request.description && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">요청 사항</p>
                <p className="whitespace-pre-line">{request.description}</p>
              </div>
            )}
            
            {/* 반려동물 사진 */}
            <div>
              <p className="text-gray-600 text-sm mb-2">반려동물 사진</p>
              {request.petPhotos && request.petPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {request.petPhotos.map((photo: any, index: number) => (
                    <div 
                      key={index} 
                      className="aspect-square overflow-hidden rounded cursor-pointer"
                      onClick={() => openPhotoViewer(photo.url)}
                    >
                      <img
                        src={photo.url}
                        alt={`Pet ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">등록된 사진이 없습니다.</p>
              )}
            </div>
          </div>
          
          {/* 서비스 항목 */}
          {items && items.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">서비스 항목</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">서비스명</th>
                      <th className="px-4 py-2 text-left text-gray-700">타입</th>
                      <th className="px-4 py-2 text-left text-gray-700">설명</th>
                      <th className="px-4 py-2 text-right text-gray-700">가격</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{getItemTypeText(item.type)}</td>
                        <td className="px-4 py-2">{item.description || '-'}</td>
                        <td className="px-4 py-2 text-right">{item.price.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* 견적 제안 목록 */}
        <div className="lg:col-span-1">
          {isCustomer && offers && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">
                견적 제안 {offers.length > 0 ? `(${offers.length})` : ''}
              </h2>
              
              {offers.length === 0 ? (
                <p className="text-gray-500">아직 받은 견적 제안이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer: any) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{offer.businessName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(offer.status)}`}>
                          {getStatusText(offer.status)}
                        </span>
                      </div>
                      
                      <p className="text-lg font-bold mb-2">{offer.price.toLocaleString()}원</p>
                      
                      {offer.estimatedTime && (
                        <p className="text-sm text-gray-600 mb-2">
                          예상 소요시간: {offer.estimatedTime}
                        </p>
                      )}
                      
                      {offer.availableDate && (
                        <p className="text-sm text-gray-600 mb-2">
                          가능 날짜: {formatDate(offer.availableDate)}
                        </p>
                      )}
                      
                      {offer.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {offer.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {offer.status === 'PENDING' && (
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            disabled={offerSubmitLoading}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                          >
                            {offerSubmitLoading ? '처리중...' : '견적 수락'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCreateChatRoom(offer.businessId)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          채팅하기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {isBusiness && myOffers && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">내 견적 제안</h2>
              
              {myOffers.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">아직 제안한 견적이 없습니다.</p>
                  
                  {request.status === 'PENDING' || request.status === 'OFFERED' ? (
                    <Link
                      href={`/quotes/${request.id}/offer`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                    >
                      견적 제안하기
                    </Link>
                  ) : (
                    <p className="text-yellow-600">
                      이미 처리된 견적 요청으로 새로운 제안을 할 수 없습니다.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {myOffers.map((offer: any) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">내 제안</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(offer.status)}`}>
                          {getStatusText(offer.status)}
                        </span>
                      </div>
                      
                      <p className="text-lg font-bold mb-2">{offer.price.toLocaleString()}원</p>
                      
                      {offer.estimatedTime && (
                        <p className="text-sm text-gray-600 mb-2">
                          예상 소요시간: {offer.estimatedTime}
                        </p>
                      )}
                      
                      {offer.availableDate && (
                        <p className="text-sm text-gray-600 mb-2">
                          가능 날짜: {formatDate(offer.availableDate)}
                        </p>
                      )}
                      
                      {offer.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {offer.description}
                          </p>
                        </div>
                      )}
                      
                      {(offer.status === 'ACCEPTED' || request.status === 'ACCEPTED') && (
                        <button
                          onClick={() => handleCreateChatRoom(request.customerId)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          고객과 채팅하기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 업체 사용자가 아직 견적을 제안하지 않았을 경우 */}
          {isBusiness && !myOffers?.length && (request.status === 'PENDING' || request.status === 'OFFERED') && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">견적 제안</h2>
              <p className="text-gray-600 mb-4">
                이 고객에게 견적을 제안하고 서비스를 제공해보세요.
              </p>
              <Link
                href={`/quotes/${request.id}/offer`}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
              >
                견적 제안하기
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* 사진 뷰어 모달 */}
      {photoViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-full">
            <img 
              src={selectedPhotoUrl} 
              alt="확대 이미지" 
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button 
              onClick={() => setPhotoViewerOpen(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteDetailPage;