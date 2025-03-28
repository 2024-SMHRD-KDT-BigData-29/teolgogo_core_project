// app/quotation/[id]/page.tsx (고객 견적 요청 상세 페이지 기본 구조)
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuotationRequest } from '@/api/quotation';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';
import QuotationOffersList from '@/components/quotation/QuotationOffersList';
import QuotationRequestDetail from '@/components/quotation/QuotationRequestDetail';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 견적 요청 타입 정의
interface QuotationRequest {
  id: string;
  customerName: string;
  description: string;
  serviceType: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'COMPLETED';
}

// 견적 제안 타입 정의
interface QuotationOffer {
  id: string;
  businessName: string;
  description: string;
  price: number;
  estimatedTime: string;
  createdAt: string;
}

export default function QuotationRequestDetailPage() {
  const { id } = useParams(); // URL에서 견적 요청 ID 가져오기
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [offers, setOffers] = useState<QuotationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 견적 요청 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getQuotationRequest(id as string);
        setRequest(data.request);
        setOffers(data.offers || []);
      } catch (err) {
        setError('견적 요청 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !request) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || '요청한 견적을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">견적 요청 상세보기</h1>
      
      {/* 견적 요청 상세 정보 */}
      <QuotationRequestDetail request={request} />
      
      {/* 지도 표시 */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-3">위치 정보</h2>
        <EnhancedKakaoMap
          initialLatitude={request.latitude}
          initialLongitude={request.longitude}
          height="300px"
        />
      </div>
      
      {/* 견적 제안 목록 */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-3">받은 견적 제안</h2>
        {offers.length > 0 ? (
          <QuotationOffersList 
            offers={offers} 
            onAcceptOffer={(offerId) => {
              // 견적 수락 처리 함수
              console.log(`견적 ${offerId} 수락됨`);
            }} 
          />
        ) : (
          <p className="text-gray-500">아직 받은 견적 제안이 없습니다.</p>
        )}
      </div>
    </div>
  );
}