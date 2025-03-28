// src/app/quotes/page.tsx
// 사용자의 견적 요청 목록을 표시하는 페이지

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyQuoteRequests } from '@/api/quote';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// 견적 요청 타입 정의
interface QuoteRequest {
  id: number;
  title: string;
  address: string;
  status: string;
  createdAt: string;
}

export default function QuoteRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // 견적 요청 목록 상태
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 인증 후 견적 요청 목록 불러오기
  useEffect(() => {
    if (authLoading) return; // 인증 상태 로딩 중이면 대기
    
    if (!isAuthenticated) {
      // 인증되지 않은 사용자는 로그인 페이지로 이동
      router.push('/login?redirect=/quotes');
      return;
    }
    
    // 견적 요청 목록 불러오기
    const fetchQuoteRequests = async () => {
      try {
        setLoading(true);
        const data = await getMyQuoteRequests();
        setQuoteRequests(data);
      } catch (err) {
        console.error('견적 요청 목록 불러오기 실패:', err);
        setError('견적 요청 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuoteRequests();
  }, [isAuthenticated, authLoading, router]);
  
  // 견적 상태에 따른 배지 색상
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 견적 상태 한글 표시
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기 중';
      case 'IN_PROGRESS':
        return '진행 중';
      case 'COMPLETED':
        return '완료됨';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 견적 요청</h1>
        <Link
          href="/quotes/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + 새 견적 요청
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p>견적 요청 목록을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : quoteRequests.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <h2 className="text-lg font-medium mb-2">견적 요청이 없습니다</h2>
          <p className="text-gray-600 mb-4">
            첫 번째 견적 요청을 작성해보세요.
          </p>
          <Link
            href="/quotes/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            새 견적 요청 작성하기
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {quoteRequests.map((quote) => (
              <li key={quote.id}>
                <Link href={`/quotes/${quote.id}`} className="block hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">{quote.title}</h2>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          quote.status
                        )}`}
                      >
                        {getStatusText(quote.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{quote.address}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      요청일: {formatDate(quote.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}