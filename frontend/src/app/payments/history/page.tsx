'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getCustomerPaymentHistory, getBusinessPaymentHistory, Payment } from '../../../api/payment';

const PaymentHistoryPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  useEffect(() => {
    // 비로그인 상태인 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/payments/history');
      return;
    }
    
    fetchPaymentHistory();
  }, [isAuthenticated, user, router]);
  
  // 결제 내역 가져오기
  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let response;
      
      if (user?.role === 'CUSTOMER') {
        response = await getCustomerPaymentHistory();
      } else if (user?.role === 'BUSINESS') {
        response = await getBusinessPaymentHistory();
      } else {
        throw new Error('알 수 없는 사용자 유형입니다.');
      }
      
      // 최신 결제 순으로 정렬
      const sortedPayments = response.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setPayments(sortedPayments);
    } catch (error: any) {
      console.error('결제 내역 조회 실패:', error);
      setError(error.response?.data?.message || '결제 내역을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 결제 상태에 따른 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'READY':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 결제 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'READY':
        return '준비됨';
      case 'IN_PROGRESS':
        return '처리중';
      case 'DONE':
        return '완료';
      case 'CANCELED':
        return '취소됨';
      case 'FAILED':
        return '실패';
      case 'EXPIRED':
        return '만료됨';
      default:
        return '알 수 없음';
    }
  };
  
  // 결제 방법에 따른 한글 텍스트
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CARD':
        return '신용카드';
      case 'VIRTUAL_ACCOUNT':
        return '가상계좌';
      case 'ACCOUNT_TRANSFER':
        return '계좌이체';
      case 'PHONE':
        return '휴대폰 결제';
      case 'KAKAO_PAY':
        return '카카오페이';
      case 'TOSS_PAY':
        return '토스페이';
      case 'NAVER_PAY':
        return '네이버페이';
      case 'PAYCO':
        return '페이코';
      default:
        return '기타';
    }
  };
  
  // 날짜 포맷팅
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
  
  // 필터링된 결제 내역
  const filteredPayments = payments.filter(payment => {
    if (filter === 'ALL') return true;
    return payment.status === filter;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">결제 내역</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('DONE')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'DONE' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            완료
          </button>
          <button
            onClick={() => setFilter('CANCELED')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'CANCELED' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            취소
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            대기중
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-4">결제 내역이 없습니다.</h2>
          {filter !== 'ALL' ? (
            <p className="text-gray-500 mb-6">
              선택한 필터에 해당하는 결제 내역이 없습니다. 다른 필터를 선택해보세요.
            </p>
          ) : (
            <p className="text-gray-500 mb-6">
              아직 결제 내역이 없습니다. 서비스를 예약하고 결제해보세요.
            </p>
          )}
          <Link 
            href="/quotes"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            견적 요청 목록으로 이동
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제일시
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'CUSTOMER' ? '업체' : '고객'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제수단
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user?.role === 'CUSTOMER' ? payment.businessName : payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPaymentMethodText(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/payments/${payment.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;