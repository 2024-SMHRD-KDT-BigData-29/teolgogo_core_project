// app/dashboard/page.tsx
// 고객 대시보드 구현

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCustomerQuotations } from '@/api/customer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Quotation {
  id: string;
  serviceType: string;
  address: string;
  date: string;
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'COMPLETED';
  offerCount: number;
}

export default function CustomerDashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // 견적 데이터 가져오기
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const data = await getCustomerQuotations();
        setQuotations(data.quotations || []);
      } catch (error) {
        console.error('견적 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);
  
  // 상태별 필터링
  const filteredQuotations = quotations.filter(quotation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return quotation.status === 'PENDING';
    if (activeTab === 'offered') return quotation.status === 'OFFERED';
    if (activeTab === 'accepted') return quotation.status === 'ACCEPTED';
    return false;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">내 견적 요청</h1>
      
      {/* 새 견적 요청 버튼 */}
      <div className="mb-6">
        <Link 
          href="/quotation/new"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          새 견적 요청하기
        </Link>
      </div>
      
      {/* 탭 메뉴 */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${
            activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('all')}
        >
          전체
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'pending' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          대기중
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'offered' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('offered')}
        >
          견적 제안 받음
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'accepted' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('accepted')}
        >
          예약 확정
        </button>
      </div>
      
      {/* 견적 목록 */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">해당하는 견적 요청이 없습니다.</p>
          <Link href="/quotation/new" className="text-blue-500 hover:underline">
            새 견적 요청하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map((quotation) => {
            // 상태에 따른 스타일과 액션 버튼 설정
            let statusStyle = "";
            let actionButton = null;
            
            switch (quotation.status) {
              case 'PENDING':
                statusStyle = "bg-yellow-100 text-yellow-800";
                actionButton = (
                  <span className="text-gray-500 text-sm">견적 대기중</span>
                );
                break;
              case 'OFFERED':
                statusStyle = "bg-blue-100 text-blue-800";
                actionButton = (
                  <Link 
                    href={`/quotation/${quotation.id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    견적 확인하기
                  </Link>
                );
                break;
              case 'ACCEPTED':
                statusStyle = "bg-green-100 text-green-800";
                actionButton = (
                  <Link 
                    href={`/chat/${quotation.id}`}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                  >
                    채팅하기
                  </Link>
                );
                break;
              default:
                statusStyle = "bg-gray-100 text-gray-800";
            }
            
            return (
              <div key={quotation.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{quotation.serviceType}</h3>
                    <p className="text-sm text-gray-500 mt-1">{quotation.address}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusStyle}`}>
                    {quotation.status === 'PENDING' && '대기중'}
                    {quotation.status === 'OFFERED' && 
                      `견적 ${quotation.offerCount}개 받음`}
                    {quotation.status === 'ACCEPTED' && '예약 확정'}
                    {quotation.status === 'COMPLETED' && '완료'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">
                    {quotation.date}
                  </div>
                  {actionButton}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}