// app/business/quotation/[id]/page.tsx (업주용 견적 제안 페이지)
// 미용업체 업주가 견적 요청을 보고 견적을 제안할 수 있는 페이지

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuotationRequest, createQuotationOffer } from '@/api/quotation';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';
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

export default function BusinessQuotationOfferPage() {
  const { id } = useParams(); // URL에서 견적 요청 ID 가져오기
  const router = useRouter();
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 제안 폼 상태
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  // 견적 요청 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getQuotationRequest(id as string);
        setRequest(data.request);
      } catch (err) {
        setError('견적 요청 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 견적 제안 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !price || !estimatedTime) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    
    try {
      setSubmitting(true);
      await createQuotationOffer(id as string, {
        description,
        price: parseInt(price.replace(/,/g, ''), 10),
        estimatedTime
      });
      
      alert('견적 제안이 성공적으로 제출되었습니다.');
      router.push('/business/dashboard');
    } catch (err) {
      setError('견적 제안 제출에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">견적 제안하기</h1>
      
      {/* 견적 요청 상세 정보 */}
      <QuotationRequestDetail request={request} />
      
      {/* 지도 표시 */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-3">고객 위치</h2>
        <EnhancedKakaoMap
          initialLatitude={request.latitude}
          initialLongitude={request.longitude}
          height="300px"
        />
      </div>
      
      {/* 견적 제안 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6 my-6">
        <h2 className="text-xl font-semibold mb-4">견적 제안 작성</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              견적 설명
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="제공할 서비스에 대한 상세 설명을 작성해주세요."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              견적 금액 (원)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={price}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                setPrice(value ? parseInt(value, 10).toLocaleString() : '');
              }}
              placeholder="금액을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예상 소요 시간
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="예: 1시간 30분"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              onClick={() => router.back()}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={submitting}
            >
              {submitting ? '제출 중...' : '견적 제안하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}